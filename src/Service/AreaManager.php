<?php

namespace EKhadi\Service;

use Shopware\Core\Framework\Context;
use Shopware\Core\Framework\DataAbstractionLayer\EntityRepository;
use Shopware\Core\Framework\DataAbstractionLayer\Search\Criteria;
use Shopware\Core\Framework\DataAbstractionLayer\Search\Filter\EqualsFilter;
use Shopware\Core\Framework\DataAbstractionLayer\Search\Filter\MultiFilter;
use Shopware\Core\Framework\Uuid\Uuid;
use EKhadi\Core\Content\EKhadi\Area\EKhadiAreaEntity;
use EKhadi\Core\Content\EKhadi\CustomerProfile\EKhadiCustomerProfileEntity;

class AreaManager
{
    /**
     * Bucket types that are permitted for credit spending at checkout.
     * "general" is excluded — it is for wallet tracking only.
     */
    // All bucket types eligible for credit spending at checkout (no cash, goods only)
    public const ESSENTIAL_BUCKET_TYPES = ['food', 'medicine', 'toiletries', 'electricity', 'baby_products'];

    public function __construct(
        private readonly EntityRepository $areaRepository,
        private readonly EntityRepository $areaShopRepository,
        private readonly EntityRepository $customerProfileRepository,
    ) {}

    // -------------------------------------------------------------------------
    // Areas
    // -------------------------------------------------------------------------

    public function createArea(string $name, ?string $description, ?string $province, Context $context): string
    {
        $areaId = Uuid::randomHex();
        $this->areaRepository->create([[
            'id'          => $areaId,
            'name'        => $name,
            'description' => $description,
            'province'    => $province,
            'createdAt'   => (new \DateTime())->format('Y-m-d H:i:s.u'),
        ]], $context);

        return $areaId;
    }

    public function getArea(string $areaId, Context $context): ?EKhadiAreaEntity
    {
        $criteria = new Criteria([$areaId]);
        $criteria->addAssociation('shops');

        return $this->areaRepository->search($criteria, $context)->first();
    }

    public function listAreas(Context $context): array
    {
        return $this->areaRepository->search(new Criteria(), $context)->getElements();
    }

    // -------------------------------------------------------------------------
    // Shop ↔ Area mapping (spaza shops = Shopware sales channels)
    // -------------------------------------------------------------------------

    public function assignShopToArea(string $salesChannelId, string $areaId, Context $context): string
    {
        // Idempotent — skip if already mapped
        $existing = $this->getAreaIdForShop($salesChannelId, $context);
        if ($existing === $areaId) {
            return $areaId;
        }

        $id = Uuid::randomHex();
        $this->areaShopRepository->create([[
            'id'             => $id,
            'areaId'         => $areaId,
            'salesChannelId' => $salesChannelId,
            'createdAt'      => (new \DateTime())->format('Y-m-d H:i:s.u'),
        ]], $context);

        return $id;
    }

    public function removeShopFromArea(string $salesChannelId, string $areaId, Context $context): void
    {
        $criteria = new Criteria();
        $criteria->addFilter(new MultiFilter(MultiFilter::CONNECTION_AND, [
            new EqualsFilter('salesChannelId', $salesChannelId),
            new EqualsFilter('areaId', $areaId),
        ]));

        $result = $this->areaShopRepository->search($criteria, $context)->first();
        if ($result) {
            $this->areaShopRepository->delete([['id' => $result->getId()]], $context);
        }
    }

    /**
     * Returns all area IDs a given shop is mapped to.
     * Most spaza shops will map to exactly one area.
     */
    public function getAreaIdsForShop(string $salesChannelId, Context $context): array
    {
        $criteria = new Criteria();
        $criteria->addFilter(new EqualsFilter('salesChannelId', $salesChannelId));

        $results = $this->areaShopRepository->search($criteria, $context)->getElements();

        return array_values(array_map(fn ($r) => $r->getAreaId(), $results));
    }

    public function getAreaIdForShop(string $salesChannelId, Context $context): ?string
    {
        $ids = $this->getAreaIdsForShop($salesChannelId, $context);

        return $ids[0] ?? null;
    }

    // -------------------------------------------------------------------------
    // Customer profiles
    // -------------------------------------------------------------------------

    public function upsertCustomerProfile(string $customerId, array $data, Context $context): void
    {
        $profile = $this->getCustomerProfile($customerId, $context);

        if ($profile) {
            $data['id']        = $profile->getId();
            $data['updatedAt'] = (new \DateTime())->format('Y-m-d H:i:s');
            $this->customerProfileRepository->update([$data], $context);
        } else {
            $data['id']         = Uuid::randomHex();
            $data['customerId'] = $customerId;
            $data['createdAt']  = (new \DateTime())->format('Y-m-d H:i:s.u');
            $this->customerProfileRepository->create([$data], $context);
        }
    }

    public function getCustomerProfile(string $customerId, Context $context): ?EKhadiCustomerProfileEntity
    {
        $criteria = new Criteria();
        $criteria->addFilter(new EqualsFilter('customerId', $customerId));

        return $this->customerProfileRepository->search($criteria, $context)->first();
    }

    public function getCustomerAreaId(string $customerId, Context $context): ?string
    {
        return $this->getCustomerProfile($customerId, $context)?->getAreaId();
    }

    // -------------------------------------------------------------------------
    // Enforcement helpers
    // -------------------------------------------------------------------------

    /**
     * Returns true when the customer's assigned area overlaps with at least one
     * area that the given shop (sales channel) serves.
     *
     * Customers with no area assigned are blocked — they must be registered first.
     * Shops with no area assigned are also blocked — admin must map them.
     */
    public function customerCanShopHere(string $customerId, string $salesChannelId, Context $context): bool
    {
        $customerAreaId = $this->getCustomerAreaId($customerId, $context);
        if ($customerAreaId === null) {
            return false;
        }

        $shopAreaIds = $this->getAreaIdsForShop($salesChannelId, $context);
        if (empty($shopAreaIds)) {
            return false;
        }

        return in_array($customerAreaId, $shopAreaIds, true);
    }

    /**
     * Validates that the given bucket type is an essential (credit-eligible) type.
     */
    public function isEssentialBucketType(string $bucketType): bool
    {
        return in_array($bucketType, self::ESSENTIAL_BUCKET_TYPES, true);
    }

    /**
     * Compute and store a credit limit based on a percentage of the grant amount.
     * Defaults to 50% of the monthly grant — adjustable per group or policy.
     */
    public function recomputeCreditLimit(string $customerId, float $percentage, Context $context): float
    {
        $profile = $this->getCustomerProfile($customerId, $context);
        if (!$profile) {
            return 0.00;
        }

        $newLimit = round($profile->getGrantAmount() * ($percentage / 100), 2);
        $this->upsertCustomerProfile($customerId, ['creditLimit' => $newLimit], $context);

        return $newLimit;
    }
}
