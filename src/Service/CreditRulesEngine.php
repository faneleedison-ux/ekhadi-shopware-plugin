<?php

namespace EKhadi\Service;

use Shopware\Core\Framework\Context;
use Shopware\Core\Framework\DataAbstractionLayer\EntityRepository;
use Shopware\Core\Framework\DataAbstractionLayer\Search\Criteria;
use Shopware\Core\Framework\DataAbstractionLayer\Search\Filter\EqualsFilter;
use Shopware\Core\Framework\DataAbstractionLayer\Search\Filter\MultiFilter;

/**
 * Behavior-based credit eligibility scoring.
 *
 * Rules (not formal credit history):
 *  - Repayment ratio         → 0–40 pts  (repaid requests / total approved)
 *  - Repayment speed         → 0–20 pts  (faster = higher)
 *  - No outstanding debt     → 0–20 pts
 *  - Grant cycle consistency → 0–20 pts  (number of completed grant cycles)
 *
 * Score → credit limit:
 *  80+  → R300
 *  60+  → R200
 *  40+  → R150
 *  20+  → R100
 *  <20  → R50  (minimum always available to any grant recipient)
 */
class CreditRulesEngine
{
    public const MIN_LIMIT = 50.0;
    public const MAX_LIMIT = 300.0;

    // Flat service fee percentage (no compound interest, no hidden costs)
    public const FEE_PERCENTAGE = 2.0;

    public function __construct(
        private readonly EntityRepository $creditRequestRepository,
        private readonly EntityRepository $repaymentScheduleRepository,
        private readonly EntityRepository $grantCycleRepository,
        private readonly AreaManager $areaManager,
    ) {}

    /**
     * Returns a full eligibility assessment for the customer.
     */
    public function assess(string $customerId, Context $context): array
    {
        $profile = $this->areaManager->getCustomerProfile($customerId, $context);

        if (!$profile || !$profile->isGrantRecipient()) {
            return [
                'eligible'    => false,
                'reason'      => 'Customer is not a registered grant recipient.',
                'score'       => 0,
                'creditLimit' => 0.0,
                'feeRate'     => self::FEE_PERCENTAGE,
            ];
        }

        $outstanding = $this->getOutstandingTotal($customerId, $context);
        if ($outstanding > 0) {
            return [
                'eligible'         => false,
                'reason'           => 'Outstanding repayment of R' . number_format($outstanding, 2) . ' must be cleared first.',
                'score'            => 0,
                'creditLimit'      => 0.0,
                'outstandingDebt'  => $outstanding,
                'feeRate'          => self::FEE_PERCENTAGE,
            ];
        }

        $score       = $this->computeScore($customerId, $context);
        $creditLimit = $this->scoreToLimit($score);

        return [
            'eligible'    => true,
            'reason'      => 'Eligible based on grant behavior.',
            'score'       => $score,
            'creditLimit' => $creditLimit,
            'feeRate'     => self::FEE_PERCENTAGE,
            'breakdown'   => $this->scoreBreakdown($customerId, $context),
        ];
    }

    /**
     * Returns the auto-approved credit limit for the customer.
     * Returns 0.0 if not eligible.
     */
    public function getEligibleLimit(string $customerId, Context $context): float
    {
        $assessment = $this->assess($customerId, $context);

        return $assessment['eligible'] ? (float) $assessment['creditLimit'] : 0.0;
    }

    /**
     * Checks whether the customer can borrow a specific amount right now.
     */
    public function canBorrow(string $customerId, float $requestAmount, Context $context): array
    {
        $limit = $this->getEligibleLimit($customerId, $context);

        if ($limit <= 0) {
            return ['allowed' => false, 'reason' => 'Not eligible for credit at this time.', 'limit' => 0.0];
        }

        if ($requestAmount > $limit) {
            return [
                'allowed' => false,
                'reason'  => "Requested R{$requestAmount} exceeds your e-Khadi credit limit of R{$limit}.",
                'limit'   => $limit,
            ];
        }

        if ($requestAmount < 10) {
            return ['allowed' => false, 'reason' => 'Minimum credit request is R10.', 'limit' => $limit];
        }

        return ['allowed' => true, 'limit' => $limit, 'fee' => round($requestAmount * self::FEE_PERCENTAGE / 100, 2)];
    }

    /**
     * Compute a flat service fee (no compound interest).
     */
    public function computeFee(float $principal): float
    {
        return round($principal * self::FEE_PERCENTAGE / 100, 2);
    }

    // -------------------------------------------------------------------------
    // Private scoring
    // -------------------------------------------------------------------------

    private function computeScore(string $customerId, Context $context): int
    {
        $breakdown = $this->scoreBreakdown($customerId, $context);

        return $breakdown['repaymentScore']
            + $breakdown['speedScore']
            + $breakdown['noDebtScore']
            + $breakdown['cycleConsistencyScore'];
    }

    private function scoreBreakdown(string $customerId, Context $context): array
    {
        // --- Repayment ratio (0–40 pts) ---
        $approvedCount = $this->countRequests($customerId, 'approved', $context)
                       + $this->countRequests($customerId, 'repaid', $context);
        $repaidCount   = $this->countRequests($customerId, 'repaid', $context);
        $repaymentRatio   = $approvedCount > 0 ? $repaidCount / $approvedCount : 0;
        $repaymentScore   = (int) round($repaymentRatio * 40);

        // --- Speed score (0–20 pts): avg days between approval and repayment ---
        // Simplified: full 20pts for any successful repayment, decaying if never repaid
        $speedScore = $repaidCount > 0 ? 20 : 0;

        // --- No outstanding debt (0–20 pts) ---
        $noDebtScore = $this->getOutstandingTotal($customerId, $context) === 0.0 ? 20 : 0;

        // --- Grant cycle consistency (0–20 pts): 2pts per completed cycle, max 10 cycles ---
        $completedCycles    = $this->countCompletedCycles($customerId, $context);
        $cycleConsistencyScore = min(20, $completedCycles * 2);

        return compact('repaymentScore', 'speedScore', 'noDebtScore', 'cycleConsistencyScore');
    }

    private function scoreToLimit(int $score): float
    {
        return match (true) {
            $score >= 80 => 300.0,
            $score >= 60 => 200.0,
            $score >= 40 => 150.0,
            $score >= 20 => 100.0,
            default      => self::MIN_LIMIT,
        };
    }

    private function getOutstandingTotal(string $customerId, Context $context): float
    {
        $criteria = new Criteria();
        $criteria->addFilter(new MultiFilter(MultiFilter::CONNECTION_AND, [
            new EqualsFilter('customerId', $customerId),
            new EqualsFilter('status', 'pending'),
        ]));

        $results = $this->repaymentScheduleRepository->search($criteria, $context)->getElements();
        $total   = 0.0;
        foreach ($results as $schedule) {
            $total += $schedule->getTotalAmountOwed();
        }

        return $total;
    }

    private function countRequests(string $customerId, string $status, Context $context): int
    {
        $criteria = new Criteria();
        $criteria->addFilter(new MultiFilter(MultiFilter::CONNECTION_AND, [
            new EqualsFilter('requesterCustomerId', $customerId),
            new EqualsFilter('status', $status),
        ]));

        return (int) $this->creditRequestRepository->search($criteria, $context)->getTotal();
    }

    private function countCompletedCycles(string $customerId, Context $context): int
    {
        $criteria = new Criteria();
        $criteria->addFilter(new MultiFilter(MultiFilter::CONNECTION_AND, [
            new EqualsFilter('customerId', $customerId),
            new EqualsFilter('status', 'completed'),
        ]));

        return (int) $this->grantCycleRepository->search($criteria, $context)->getTotal();
    }
}
