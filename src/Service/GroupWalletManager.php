<?php

namespace EKhadi\Service;

use Shopware\Core\Framework\Context;
use Shopware\Core\Framework\DataAbstractionLayer\EntityRepository;
use Shopware\Core\Framework\DataAbstractionLayer\Search\Criteria;
use Shopware\Core\Framework\DataAbstractionLayer\Search\Filter\EqualsFilter;
use Shopware\Core\Framework\DataAbstractionLayer\Search\Filter\MultiFilter;
use Shopware\Core\Framework\Uuid\Uuid;
use EKhadi\Core\Content\EKhadi\GroupBucket\EKhadiGroupBucketEntity;
use EKhadi\Core\Content\EKhadi\GroupWallet\EKhadiGroupWalletEntity;

class GroupWalletManager
{
    public const VALID_BUCKET_TYPES = ['food', 'medicine', 'toiletries', 'electricity', 'baby_products', 'general'];

    public function __construct(
        private readonly EntityRepository $walletRepository,
        private readonly EntityRepository $bucketRepository,
        private readonly GroupManager $groupManager,
    ) {}

    // -------------------------------------------------------------------------
    // Wallet
    // -------------------------------------------------------------------------

    public function getWalletByGroup(string $groupId, Context $context): ?EKhadiGroupWalletEntity
    {
        $criteria = new Criteria();
        $criteria->addFilter(new EqualsFilter('groupId', $groupId));
        $criteria->addAssociation('buckets');

        return $this->walletRepository->search($criteria, $context)->first();
    }

    /**
     * Allocate funds into the wallet total balance (e.g., when a member makes a contribution).
     */
    public function creditWallet(string $groupId, float $amount, Context $context): void
    {
        $wallet = $this->getWalletByGroup($groupId, $context);
        if (!$wallet) {
            throw new \RuntimeException("No wallet found for group $groupId.");
        }

        $this->walletRepository->update([[
            'id'        => $wallet->getId(),
            'balance'   => $wallet->getBalance() + $amount,
            'updatedAt' => (new \DateTime())->format('Y-m-d H:i:s'),
        ]], $context);
    }

    // -------------------------------------------------------------------------
    // Buckets
    // -------------------------------------------------------------------------

    public function ensureBucket(string $groupId, string $bucketType, ?array $allowedCategories, Context $context): string
    {
        if (!in_array($bucketType, self::VALID_BUCKET_TYPES, true)) {
            throw new \RuntimeException("Invalid bucket type '$bucketType'.");
        }

        $wallet = $this->getWalletByGroup($groupId, $context);
        if (!$wallet) {
            throw new \RuntimeException("No wallet found for group $groupId.");
        }

        // Return existing bucket if present
        $existing = $this->getBucketByType($wallet->getId(), $bucketType, $context);
        if ($existing) {
            return $existing->getId();
        }

        $bucketId = Uuid::randomHex();
        $this->bucketRepository->create([[
            'id'                => $bucketId,
            'walletId'          => $wallet->getId(),
            'bucketType'        => $bucketType,
            'balance'           => 0.00,
            'allowedCategories' => $allowedCategories,
            'createdAt'         => (new \DateTime())->format('Y-m-d H:i:s.u'),
        ]], $context);

        return $bucketId;
    }

    public function creditBucket(string $groupId, string $bucketType, float $amount, Context $context): void
    {
        $wallet = $this->getWalletByGroup($groupId, $context);
        if (!$wallet) {
            throw new \RuntimeException("No wallet found for group $groupId.");
        }

        $bucket = $this->getBucketByType($wallet->getId(), $bucketType, $context);
        if (!$bucket) {
            throw new \RuntimeException("Bucket '$bucketType' not found for group $groupId.");
        }

        $this->bucketRepository->update([[
            'id'        => $bucket->getId(),
            'balance'   => $bucket->getBalance() + $amount,
            'updatedAt' => (new \DateTime())->format('Y-m-d H:i:s'),
        ]], $context);
    }

    public function deductFromBucket(string $groupId, string $bucketType, float $amount, Context $context): void
    {
        $wallet = $this->getWalletByGroup($groupId, $context);
        if (!$wallet) {
            throw new \RuntimeException("No wallet found for group $groupId.");
        }

        $bucket = $this->getBucketByType($wallet->getId(), $bucketType, $context);
        if (!$bucket) {
            throw new \RuntimeException("Bucket '$bucketType' not found for group $groupId.");
        }

        if ($bucket->getBalance() < $amount) {
            throw new \RuntimeException("Insufficient balance in bucket '$bucketType'.");
        }

        $this->bucketRepository->update([[
            'id'        => $bucket->getId(),
            'balance'   => $bucket->getBalance() - $amount,
            'updatedAt' => (new \DateTime())->format('Y-m-d H:i:s'),
        ]], $context);

        // Mirror deduction on the wallet total
        $this->walletRepository->update([[
            'id'        => $wallet->getId(),
            'balance'   => max(0.0, $wallet->getBalance() - $amount),
            'updatedAt' => (new \DateTime())->format('Y-m-d H:i:s'),
        ]], $context);
    }

    /**
     * Resolve a bucket for the given customer (via their active group) and bucket type.
     */
    public function getMemberBucket(string $customerId, string $bucketType, Context $context): ?EKhadiGroupBucketEntity
    {
        $groupId = $this->groupManager->getMemberGroupId($customerId, $context);
        if (!$groupId) {
            return null;
        }

        $wallet = $this->getWalletByGroup($groupId, $context);
        if (!$wallet) {
            return null;
        }

        return $this->getBucketByType($wallet->getId(), $bucketType, $context);
    }

    public function getWalletById(string $walletId, Context $context): ?EKhadiGroupWalletEntity
    {
        $criteria = new Criteria([$walletId]);
        return $this->walletRepository->search($criteria, $context)->first();
    }

    public function getBucketByType(string $walletId, string $bucketType, Context $context): ?EKhadiGroupBucketEntity
    {
        $criteria = new Criteria();
        $criteria->addFilter(new MultiFilter(MultiFilter::CONNECTION_AND, [
            new EqualsFilter('walletId', $walletId),
            new EqualsFilter('bucketType', $bucketType),
        ]));

        return $this->bucketRepository->search($criteria, $context)->first();
    }

    public function updateBucketCategories(string $bucketId, ?array $allowedCategories, Context $context): void
    {
        $this->bucketRepository->update([[
            'id'                => $bucketId,
            'allowedCategories' => $allowedCategories,
            'updatedAt'         => (new \DateTime())->format('Y-m-d H:i:s'),
        ]], $context);
    }
}
