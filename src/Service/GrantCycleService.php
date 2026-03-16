<?php

namespace EKhadi\Service;

use Shopware\Core\Framework\Context;
use Shopware\Core\Framework\DataAbstractionLayer\EntityRepository;
use Shopware\Core\Framework\DataAbstractionLayer\Search\Criteria;
use Shopware\Core\Framework\DataAbstractionLayer\Search\Filter\EqualsFilter;
use Shopware\Core\Framework\DataAbstractionLayer\Search\Filter\MultiFilter;
use Shopware\Core\Framework\DataAbstractionLayer\Search\Sorting\FieldSorting;
use Shopware\Core\Framework\Uuid\Uuid;
use EKhadi\Core\Content\EKhadi\GrantCycle\EKhadiGrantCycleEntity;

class GrantCycleService
{
    public const STATUS_ACTIVE    = 'active';
    public const STATUS_COMPLETED = 'completed';

    // Risk levels returned to callers
    public const RISK_LOW    = 'low';    // 0–39
    public const RISK_MEDIUM = 'medium'; // 40–69
    public const RISK_HIGH   = 'high';   // 70–100

    public function __construct(
        private readonly EntityRepository $grantCycleRepository,
        private readonly AreaManager $areaManager,
        private readonly StoreCreditManager $storeCreditManager,
    ) {}

    // -------------------------------------------------------------------------
    // Grant payment recording
    // -------------------------------------------------------------------------

    /**
     * Called when a SASSA grant payment arrives.
     * 1. Closes the previous active cycle.
     * 2. Opens a new cycle covering the next grant period.
     * 3. Credits the amount to the customer's personal store credit wallet.
     *
     * Returns the new cycle ID.
     */
    public function recordGrantPayment(
        string $customerId,
        float $grantAmount,
        \DateTimeInterface $paymentDate,
        ?string $currencyId,
        Context $context
    ): string {
        // Close any currently active cycle
        $activeCycle = $this->getActiveCycle($customerId, $context);
        if ($activeCycle) {
            $this->grantCycleRepository->update([[
                'id'        => $activeCycle->getId(),
                'status'    => self::STATUS_COMPLETED,
                'updatedAt' => (new \DateTime())->format('Y-m-d H:i:s'),
            ]], $context);
        }

        // Determine cycle end: the day before the next grant pay day
        $profile      = $this->areaManager->getCustomerProfile($customerId, $context);
        $grantPayDay  = $profile?->getGrantPayDay() ?? 1;
        $cycleStart   = \DateTime::createFromInterface($paymentDate);
        $cycleEnd     = $this->nextGrantDate($cycleStart, $grantPayDay)->modify('-1 day');

        $cycleId = Uuid::randomHex();
        $this->grantCycleRepository->create([[
            'id'                 => $cycleId,
            'customerId'         => $customerId,
            'grantAmount'        => $grantAmount,
            'paymentDate'        => $cycleStart->format('Y-m-d H:i:s.u'),
            'cycleStart'         => $cycleStart->format('Y-m-d H:i:s.u'),
            'cycleEnd'           => $cycleEnd->format('Y-m-d H:i:s.u'),
            'amountSpent'        => 0.00,
            'shortfallRiskScore' => 0,
            'status'             => self::STATUS_ACTIVE,
            'createdAt'          => (new \DateTime())->format('Y-m-d H:i:s.u'),
        ]], $context);

        // Credit the grant amount into the customer's e-Khadi wallet
        $this->storeCreditManager->addCredit(
            $customerId,
            null,
            $currencyId,
            $grantAmount,
            $context,
            'SASSA SRD grant payment'
        );

        return $cycleId;
    }

    // -------------------------------------------------------------------------
    // Spend tracking
    // -------------------------------------------------------------------------

    /**
     * Increment amount_spent on the active cycle and recompute the shortfall risk score.
     * Called by CartSubscriber after a successful bucket deduction.
     */
    public function recordSpend(string $customerId, float $amount, Context $context): void
    {
        $cycle = $this->getActiveCycle($customerId, $context);
        if (!$cycle) {
            return;
        }

        $newSpent = $cycle->getAmountSpent() + $amount;
        $newRisk  = $this->computeRiskScore($cycle, $newSpent);

        $this->grantCycleRepository->update([[
            'id'                 => $cycle->getId(),
            'amountSpent'        => $newSpent,
            'shortfallRiskScore' => $newRisk,
            'updatedAt'          => (new \DateTime())->format('Y-m-d H:i:s'),
        ]], $context);
    }

    // -------------------------------------------------------------------------
    // Spending status (for API / credit scoring)
    // -------------------------------------------------------------------------

    /**
     * Returns a rich spending status snapshot:
     *  - days_elapsed, days_remaining
     *  - daily_spend_rate
     *  - projected_end_balance
     *  - shortfall_risk_score (0–100)
     *  - risk_level: low / medium / high
     */
    public function getSpendingStatus(string $customerId, Context $context): array
    {
        $cycle = $this->getActiveCycle($customerId, $context);
        if (!$cycle) {
            return [
                'hasCycle'           => false,
                'daysElapsed'        => 0,
                'daysRemaining'      => 0,
                'dailySpendRate'     => 0.0,
                'amountSpent'        => 0.0,
                'projectedEndBalance'=> 0.0,
                'shortfallRiskScore' => 0,
                'riskLevel'          => self::RISK_LOW,
            ];
        }

        $today          = new \DateTime('today');
        $cycleStart     = \DateTime::createFromInterface($cycle->getCycleStart());
        $cycleEnd       = \DateTime::createFromInterface($cycle->getCycleEnd());
        $daysElapsed    = max(1, $this->diffDaysForward($cycleStart, $today));
        $daysRemaining  = $this->diffDaysForward($today, $cycleEnd);
        $cycleLengthDays = max(1, $this->diffDaysForward($cycleStart, $cycleEnd));

        $dailySpendRate = $cycle->getAmountSpent() / $daysElapsed;

        $walletBalance   = $this->storeCreditManager->getCreditBalance($customerId, $context)['balanceAmount'];
        $projectedSpend  = $dailySpendRate * $daysRemaining;
        $projectedEndBal = $walletBalance - $projectedSpend;

        $riskScore = $this->computeRiskScore($cycle, $cycle->getAmountSpent());
        $riskLevel = match (true) {
            $riskScore >= 70 => self::RISK_HIGH,
            $riskScore >= 40 => self::RISK_MEDIUM,
            default          => self::RISK_LOW,
        };

        return [
            'hasCycle'            => true,
            'cycleStart'          => $cycle->getCycleStart()?->format('Y-m-d'),
            'cycleEnd'            => $cycle->getCycleEnd()?->format('Y-m-d'),
            'daysElapsed'         => $daysElapsed,
            'daysRemaining'       => $daysRemaining,
            'grantAmount'         => $cycle->getGrantAmount(),
            'amountSpent'         => $cycle->getAmountSpent(),
            'dailySpendRate'      => round($dailySpendRate, 2),
            'currentBalance'      => $walletBalance,
            'projectedEndBalance' => round($projectedEndBal, 2),
            'shortfallRiskScore'  => $riskScore,
            'riskLevel'           => $riskLevel,
            'willRunShort'        => $projectedEndBal < 0,
        ];
    }

    public function getActiveCycle(string $customerId, Context $context): ?EKhadiGrantCycleEntity
    {
        $criteria = new Criteria();
        $criteria->addFilter(new MultiFilter(MultiFilter::CONNECTION_AND, [
            new EqualsFilter('customerId', $customerId),
            new EqualsFilter('status', self::STATUS_ACTIVE),
        ]));

        return $this->grantCycleRepository->search($criteria, $context)->first();
    }

    public function getCycleHistory(string $customerId, int $limit, Context $context): array
    {
        $criteria = new Criteria();
        $criteria->addFilter(new EqualsFilter('customerId', $customerId));
        $criteria->addSorting(new FieldSorting('paymentDate', FieldSorting::DESCENDING));
        $criteria->setLimit($limit);

        return $this->grantCycleRepository->search($criteria, $context)->getElements();
    }

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    /**
     * Risk score 0–100: how likely is the customer to run out before the next grant.
     * Higher = more at risk.
     */
    private function computeRiskScore(EKhadiGrantCycleEntity $cycle, float $currentlySpent): int
    {
        $grantAmount = $cycle->getGrantAmount();
        if ($grantAmount <= 0) {
            return 0;
        }

        $cycleStart    = \DateTime::createFromInterface($cycle->getCycleStart());
        $cycleEnd      = \DateTime::createFromInterface($cycle->getCycleEnd());
        $today         = new \DateTime('today');
        $totalDays     = max(1, $this->diffDaysForward($cycleStart, $cycleEnd));
        $daysElapsed   = min($totalDays, max(1, $this->diffDaysForward($cycleStart, $today)));
        $daysRemaining = max(0, $totalDays - $daysElapsed);

        $dailyRate      = $currentlySpent / $daysElapsed;
        $projectedTotal = $currentlySpent + ($dailyRate * $daysRemaining);

        // Score based on projected-total / grant-amount ratio
        $ratio = min($projectedTotal / $grantAmount, 2.0); // cap at 200%

        return (int) min(100, round($ratio * 50));
    }

    private function nextGrantDate(\DateTime $from, int $grantPayDay): \DateTime
    {
        $next = clone $from;
        $next->modify('+1 month');
        $next->setDate((int) $next->format('Y'), (int) $next->format('m'), min($grantPayDay, (int) $next->format('t')));

        return $next;
    }

    private function diffDaysForward(\DateTimeInterface $from, \DateTimeInterface $to): int
    {
        $interval = $from->diff($to);
        if ($interval->invert === 1) {
            return 0;
        }

        return (int) $interval->days;
    }
}
