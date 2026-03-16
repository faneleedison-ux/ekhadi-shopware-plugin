<?php

namespace EKhadi\Service;

use Shopware\Core\Framework\Context;
use Shopware\Core\Framework\DataAbstractionLayer\EntityRepository;
use Shopware\Core\Framework\DataAbstractionLayer\Search\Criteria;
use Shopware\Core\Framework\DataAbstractionLayer\Search\Filter\EqualsFilter;
use Shopware\Core\Framework\DataAbstractionLayer\Search\Filter\MultiFilter;
use Shopware\Core\Framework\Uuid\Uuid;
use EKhadi\Core\Content\EKhadi\Group\EKhadiGroupEntity;
use EKhadi\Core\Content\EKhadi\GroupMember\EKhadiGroupMemberEntity;

class GroupManager
{
    public const VALID_STATUSES  = ['active', 'inactive', 'closed'];
    public const VALID_ROLES     = ['admin', 'member'];

    public function __construct(
        private readonly EntityRepository $groupRepository,
        private readonly EntityRepository $memberRepository,
        private readonly EntityRepository $walletRepository,
    ) {}

    // -------------------------------------------------------------------------
    // Groups
    // -------------------------------------------------------------------------

    public function createGroup(
        string $name,
        ?string $description,
        ?string $currencyId,
        int $maxMembers,
        int $contributionDay,
        Context $context
    ): string {
        $groupId = Uuid::randomHex();

        $this->groupRepository->create([[
            'id'              => $groupId,
            'name'            => $name,
            'description'     => $description,
            'status'          => 'active',
            'maxMembers'      => $maxMembers,
            'contributionDay' => $contributionDay,
            'currencyId'      => $currencyId,
            'createdAt'       => (new \DateTime())->format('Y-m-d H:i:s.u'),
        ]], $context);

        // Auto-create a wallet for the group
        $this->walletRepository->create([[
            'id'         => Uuid::randomHex(),
            'groupId'    => $groupId,
            'balance'    => 0.00,
            'currencyId' => $currencyId,
            'createdAt'  => (new \DateTime())->format('Y-m-d H:i:s.u'),
        ]], $context);

        return $groupId;
    }

    public function getGroup(string $groupId, Context $context): ?EKhadiGroupEntity
    {
        $criteria = new Criteria([$groupId]);
        $criteria->addAssociation('members');
        $criteria->addAssociation('wallet.buckets');

        return $this->groupRepository->search($criteria, $context)->first();
    }

    public function updateGroup(string $groupId, array $data, Context $context): void
    {
        $data['id'] = $groupId;
        $data['updatedAt'] = (new \DateTime())->format('Y-m-d H:i:s');
        $this->groupRepository->update([$data], $context);
    }

    public function listGroups(Context $context): array
    {
        $criteria = new Criteria();
        $criteria->addFilter(new EqualsFilter('status', 'active'));
        $criteria->addAssociation('members');

        return $this->groupRepository->search($criteria, $context)->getElements();
    }

    // -------------------------------------------------------------------------
    // Members
    // -------------------------------------------------------------------------

    public function addMember(
        string $groupId,
        string $customerId,
        string $role,
        float $monthlyCommitment,
        Context $context
    ): string {
        $group = $this->getGroup($groupId, $context);
        if (!$group) {
            throw new \RuntimeException("Group $groupId not found.");
        }

        $memberCount = count($group->getMembers() ?? []);
        if ($memberCount >= $group->getMaxMembers()) {
            throw new \RuntimeException("Group has reached its maximum member count of {$group->getMaxMembers()}.");
        }

        // Check for duplicate
        $criteria = new Criteria();
        $criteria->addFilter(new MultiFilter(MultiFilter::CONNECTION_AND, [
            new EqualsFilter('groupId', $groupId),
            new EqualsFilter('customerId', $customerId),
        ]));
        if ($this->memberRepository->search($criteria, $context)->getTotal() > 0) {
            throw new \RuntimeException("Customer $customerId is already a member of group $groupId.");
        }

        if (!in_array($role, self::VALID_ROLES, true)) {
            throw new \RuntimeException("Invalid role '$role'. Must be one of: " . implode(', ', self::VALID_ROLES));
        }

        $memberId = Uuid::randomHex();
        $this->memberRepository->create([[
            'id'                => $memberId,
            'groupId'           => $groupId,
            'customerId'        => $customerId,
            'role'              => $role,
            'status'            => 'active',
            'joinDate'          => (new \DateTime())->format('Y-m-d H:i:s.u'),
            'monthlyCommitment' => $monthlyCommitment,
            'createdAt'         => (new \DateTime())->format('Y-m-d H:i:s.u'),
        ]], $context);

        return $memberId;
    }

    public function removeMember(string $memberId, Context $context): void
    {
        $this->memberRepository->update([[
            'id'        => $memberId,
            'status'    => 'inactive',
            'updatedAt' => (new \DateTime())->format('Y-m-d H:i:s'),
        ]], $context);
    }

    public function getGroupMembers(string $groupId, Context $context): array
    {
        $criteria = new Criteria();
        $criteria->addFilter(new MultiFilter(MultiFilter::CONNECTION_AND, [
            new EqualsFilter('groupId', $groupId),
            new EqualsFilter('status', 'active'),
        ]));

        return $this->memberRepository->search($criteria, $context)->getElements();
    }

    public function getMemberGroupId(string $customerId, Context $context): ?string
    {
        $criteria = new Criteria();
        $criteria->addFilter(new MultiFilter(MultiFilter::CONNECTION_AND, [
            new EqualsFilter('customerId', $customerId),
            new EqualsFilter('status', 'active'),
        ]));

        /** @var EKhadiGroupMemberEntity|null $member */
        $member = $this->memberRepository->search($criteria, $context)->first();

        return $member?->getGroupId();
    }
}
