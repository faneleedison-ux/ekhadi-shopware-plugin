<?php

namespace EKhadi\Service;

use Shopware\Core\Framework\Context;
use Shopware\Core\Framework\DataAbstractionLayer\EntityRepository;
use Shopware\Core\Framework\DataAbstractionLayer\Search\Criteria;
use Shopware\Core\Framework\DataAbstractionLayer\Search\Filter\EqualsFilter;
use Shopware\Core\Framework\DataAbstractionLayer\Search\Filter\MultiFilter;
use Shopware\Core\Framework\DataAbstractionLayer\Search\Sorting\FieldSorting;
use Shopware\Core\Framework\Uuid\Uuid;
use EKhadi\Core\Content\EKhadi\RotationCycle\EKhadiRotationCycleEntity;

class RotationManager
{
    public const STATUS_PENDING   = 'pending';
    public const STATUS_ACTIVE    = 'active';
    public const STATUS_COMPLETED = 'completed';
    public const STATUS_SKIPPED   = 'skipped';

    public function __construct(
        private readonly EntityRepository $cycleRepository,
        private readonly GroupManager $groupManager,
        private readonly StoreCreditManager $storeCreditManager,
    ) {}

    /**
     * Create the full rotation schedule for a group. Each active member gets one cycle
     * in the order they joined. Cycles are monthly by default.
     */
    public function scheduleRotation(string $groupId, \DateTimeInterface $firstCycleStart, Context $context): array
    {
        $members = $this->groupManager->getGroupMembers($groupId, $context);
        if (empty($members)) {
            throw new \RuntimeException("Group $groupId has no active members to schedule.");
        }

        $createdIds = [];
        $cycleStart = \DateTime::createFromInterface($firstCycleStart);

        foreach (array_values($members) as $index => $member) {
            $cycleEnd = (clone $cycleStart)->modify('+1 month -1 day');

            $cycleId = Uuid::randomHex();
            $this->cycleRepository->create([[
                'id'                      => $cycleId,
                'groupId'                 => $groupId,
                'cycleNumber'             => $index + 1,
                'beneficiaryCustomerId'   => $member->getCustomerId(),
                'startDate'               => $cycleStart->format('Y-m-d H:i:s.u'),
                'endDate'                 => $cycleEnd->format('Y-m-d H:i:s.u'),
                'status'                  => self::STATUS_PENDING,
                'payoutAmount'            => 0.00,
                'createdAt'               => (new \DateTime())->format('Y-m-d H:i:s.u'),
            ]], $context);

            $createdIds[] = $cycleId;
            $cycleStart->modify('+1 month');
        }

        return $createdIds;
    }

    /**
     * Activate the next pending cycle for a group (and complete any currently active one).
     */
    public function advanceCycle(string $groupId, Context $context): EKhadiRotationCycleEntity
    {
        // Complete any currently active cycle
        $activeCycle = $this->getActiveCycle($groupId, $context);
        if ($activeCycle) {
            $this->cycleRepository->update([[
                'id'        => $activeCycle->getId(),
                'status'    => self::STATUS_COMPLETED,
                'updatedAt' => (new \DateTime())->format('Y-m-d H:i:s'),
            ]], $context);
        }

        // Activate the next pending cycle
        $nextCycle = $this->getNextPendingCycle($groupId, $context);
        if (!$nextCycle) {
            throw new \RuntimeException("No pending cycles remain for group $groupId.");
        }

        $this->cycleRepository->update([[
            'id'        => $nextCycle->getId(),
            'status'    => self::STATUS_ACTIVE,
            'updatedAt' => (new \DateTime())->format('Y-m-d H:i:s'),
        ]], $context);

        return $nextCycle;
    }

    /**
     * Pay out the current cycle's beneficiary by crediting their store credit wallet.
     */
    public function payoutCurrentCycle(string $groupId, float $amount, ?string $currencyId, Context $context): void
    {
        $cycle = $this->getActiveCycle($groupId, $context);
        if (!$cycle) {
            throw new \RuntimeException("No active cycle for group $groupId.");
        }

        // Record payout amount on cycle
        $this->cycleRepository->update([[
            'id'           => $cycle->getId(),
            'payoutAmount' => $cycle->getPayoutAmount() + $amount,
            'updatedAt'    => (new \DateTime())->format('Y-m-d H:i:s'),
        ]], $context);

        // Credit the beneficiary's personal store credit balance
        $this->storeCreditManager->addCredit(
            $cycle->getBeneficiaryCustomerId(),
            null,
            $currencyId,
            $amount,
            $context,
            "Stokvel rotation payout — cycle #{$cycle->getCycleNumber()}"
        );
    }

    public function getActiveCycle(string $groupId, Context $context): ?EKhadiRotationCycleEntity
    {
        $criteria = new Criteria();
        $criteria->addFilter(new MultiFilter(MultiFilter::CONNECTION_AND, [
            new EqualsFilter('groupId', $groupId),
            new EqualsFilter('status', self::STATUS_ACTIVE),
        ]));

        return $this->cycleRepository->search($criteria, $context)->first();
    }

    public function getNextPendingCycle(string $groupId, Context $context): ?EKhadiRotationCycleEntity
    {
        $criteria = new Criteria();
        $criteria->addFilter(new MultiFilter(MultiFilter::CONNECTION_AND, [
            new EqualsFilter('groupId', $groupId),
            new EqualsFilter('status', self::STATUS_PENDING),
        ]));
        $criteria->addSorting(new FieldSorting('cycleNumber', FieldSorting::ASCENDING));
        $criteria->setLimit(1);

        return $this->cycleRepository->search($criteria, $context)->first();
    }

    public function listCycles(string $groupId, Context $context): array
    {
        $criteria = new Criteria();
        $criteria->addFilter(new EqualsFilter('groupId', $groupId));
        $criteria->addSorting(new FieldSorting('cycleNumber', FieldSorting::ASCENDING));

        return $this->cycleRepository->search($criteria, $context)->getElements();
    }

    public function skipCycle(string $cycleId, Context $context): void
    {
        $this->cycleRepository->update([[
            'id'        => $cycleId,
            'status'    => self::STATUS_SKIPPED,
            'updatedAt' => (new \DateTime())->format('Y-m-d H:i:s'),
        ]], $context);
    }
}
