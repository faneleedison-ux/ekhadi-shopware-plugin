<?php

namespace EKhadi\Service;

use Shopware\Core\Framework\Context;
use Shopware\Core\Framework\DataAbstractionLayer\EntityRepository;
use Shopware\Core\Framework\DataAbstractionLayer\Search\Criteria;
use Shopware\Core\Framework\DataAbstractionLayer\Search\Filter\EqualsFilter;
use Shopware\Core\Framework\DataAbstractionLayer\Search\Filter\MultiFilter;
use Shopware\Core\Framework\Uuid\Uuid;
use EKhadi\Core\Content\EKhadi\RepaymentSchedule\EKhadiRepaymentScheduleEntity;

class RepaymentService
{
    public const STATUS_PENDING   = 'pending';
    public const STATUS_PROCESSED = 'processed';
    public const STATUS_PARTIAL   = 'partial';
    public const STATUS_FAILED    = 'failed';

    public function __construct(
        private readonly EntityRepository $repaymentScheduleRepository,
        private readonly EntityRepository $creditRequestRepository,
        private readonly StoreCreditManager $storeCreditManager,
        private readonly CreditRulesEngine $creditRulesEngine,
        private readonly AreaManager $areaManager,
    ) {}

    // -------------------------------------------------------------------------
    // Schedule
    // -------------------------------------------------------------------------

    /**
     * Called when a credit request is approved and funds are disbursed.
     * Adds the repayment to the customer's pending schedule (upsert — one row per customer).
     */
    public function addToSchedule(
        string $customerId,
        float $principal,
        string $creditRequestId,
        Context $context
    ): void {
        $fee      = $this->creditRulesEngine->computeFee($principal);
        $dueDate  = $this->nextGrantDate($customerId, $context);
        $existing = $this->getPendingSchedule($customerId, $context);

        if ($existing) {
            $newPrincipal   = $existing->getPrincipalOwed() + $principal;
            $newFee         = $existing->getFeeAmount() + $fee;
            $existingIds    = $existing->getCreditRequestIds() ?? [];
            $existingIds[]  = $creditRequestId;

            $this->repaymentScheduleRepository->update([[
                'id'               => $existing->getId(),
                'principalOwed'    => $newPrincipal,
                'feeAmount'        => $newFee,
                'totalAmountOwed'  => $newPrincipal + $newFee,
                'creditRequestIds' => $existingIds,
                'dueDate'          => $dueDate->format('Y-m-d H:i:s.u'),
                'updatedAt'        => (new \DateTime())->format('Y-m-d H:i:s'),
            ]], $context);
        } else {
            $this->repaymentScheduleRepository->create([[
                'id'               => Uuid::randomHex(),
                'customerId'       => $customerId,
                'principalOwed'    => $principal,
                'feeAmount'        => $fee,
                'totalAmountOwed'  => $principal + $fee,
                'dueDate'          => $dueDate->format('Y-m-d H:i:s.u'),
                'status'           => self::STATUS_PENDING,
                'creditRequestIds' => [$creditRequestId],
                'createdAt'        => (new \DateTime())->format('Y-m-d H:i:s.u'),
            ]], $context);
        }
    }

    // -------------------------------------------------------------------------
    // Automatic repayment (triggered when grant arrives)
    // -------------------------------------------------------------------------

    /**
     * Called by GrantCycleService after crediting the grant.
     * Automatically deducts the outstanding amount + fee from the freshly loaded wallet.
     * Returns the amount actually deducted (may be less than owed if grant insufficient).
     */
    public function processGrantRepayment(string $customerId, float $grantAmount, ?string $currencyId, Context $context): float
    {
        $schedule = $this->getPendingSchedule($customerId, $context);
        if (!$schedule || $schedule->getTotalAmountOwed() <= 0) {
            return 0.0;
        }

        $owed        = $schedule->getTotalAmountOwed();
        $deductAmount = min($owed, $grantAmount);

        $result = $this->storeCreditManager->deductCredit(
            $customerId,
            $deductAmount,
            $context,
            null,
            $currencyId,
            'Automatic repayment of Khadi Credit — principal + flat fee'
        );

        if ($result !== null) {
            $newStatus = $deductAmount >= $owed ? self::STATUS_PROCESSED : self::STATUS_PARTIAL;

            $this->repaymentScheduleRepository->update([[
                'id'          => $schedule->getId(),
                'status'      => $newStatus,
                'processedAt' => (new \DateTime())->format('Y-m-d H:i:s.u'),
                'updatedAt'   => (new \DateTime())->format('Y-m-d H:i:s'),
            ]], $context);

            // Mark all linked credit requests as repaid
            if ($newStatus === self::STATUS_PROCESSED) {
                foreach ($schedule->getCreditRequestIds() ?? [] as $requestId) {
                    $this->creditRequestRepository->update([[
                        'id'        => $requestId,
                        'status'    => 'repaid',
                        'repaidAt'  => (new \DateTime())->format('Y-m-d H:i:s.u'),
                        'updatedAt' => (new \DateTime())->format('Y-m-d H:i:s'),
                    ]], $context);
                }
            }

            return $deductAmount;
        }

        // Deduction failed (insufficient funds — shouldn't happen since we just credited)
        $this->repaymentScheduleRepository->update([[
            'id'        => $schedule->getId(),
            'status'    => self::STATUS_FAILED,
            'updatedAt' => (new \DateTime())->format('Y-m-d H:i:s'),
        ]], $context);

        return 0.0;
    }

    // -------------------------------------------------------------------------
    // Queries
    // -------------------------------------------------------------------------

    public function getPendingSchedule(string $customerId, Context $context): ?EKhadiRepaymentScheduleEntity
    {
        $criteria = new Criteria();
        $criteria->addFilter(new MultiFilter(MultiFilter::CONNECTION_AND, [
            new EqualsFilter('customerId', $customerId),
            new EqualsFilter('status', self::STATUS_PENDING),
        ]));

        return $this->repaymentScheduleRepository->search($criteria, $context)->first();
    }

    public function getOutstandingTotal(string $customerId, Context $context): float
    {
        return $this->getPendingSchedule($customerId, $context)?->getTotalAmountOwed() ?? 0.0;
    }

    public function getScheduleHistory(string $customerId, Context $context): array
    {
        $criteria = new Criteria();
        $criteria->addFilter(new EqualsFilter('customerId', $customerId));

        return $this->repaymentScheduleRepository->search($criteria, $context)->getElements();
    }

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    private function nextGrantDate(string $customerId, Context $context): \DateTime
    {
        $profile     = $this->areaManager->getCustomerProfile($customerId, $context);
        $grantPayDay = $profile?->getGrantPayDay() ?? 1;
        $today       = new \DateTime('today');

        // Next occurrence of grantPayDay
        $candidate = new \DateTime($today->format('Y-m-') . sprintf('%02d', min($grantPayDay, (int) $today->format('t'))));
        if ($candidate <= $today) {
            $candidate->modify('+1 month');
            $candidate->setDate(
                (int) $candidate->format('Y'),
                (int) $candidate->format('m'),
                min($grantPayDay, (int) $candidate->format('t'))
            );
        }

        return $candidate;
    }
}
