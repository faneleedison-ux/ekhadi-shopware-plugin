<?php

namespace EKhadi\Controller\Api;

use Shopware\Core\Framework\Context;
use EKhadi\Service\AreaManager;
use EKhadi\Service\CreditRulesEngine;
use EKhadi\Service\GrantCycleService;
use EKhadi\Service\RepaymentService;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

#[Route(defaults: ['_routeScope' => ['api'], '_loginRequired' => true])]
class EKhadiGrantController
{
    public function __construct(
        private readonly GrantCycleService $grantCycleService,
        private readonly RepaymentService $repaymentService,
        private readonly CreditRulesEngine $creditRulesEngine,
        private readonly AreaManager $areaManager,
    ) {}

    /**
     * POST /api/ekhadi/customer/{customerId}/grant-payment
     *
     * Called when SASSA deposits a grant. This endpoint:
     *   1. Opens a new grant cycle (closes the previous one)
     *   2. Credits the grant amount to the customer's e-Khadi wallet
     *   3. Automatically deducts any outstanding Khadi Credit (principal + flat fee)
     *   4. Recomputes the customer's credit limit based on updated behavior score
     *
     * Body: { "grantAmount": 350.00, "currencyId": "...", "paymentDate": "2025-05-05" }
     */
    #[Route(path: '/api/ekhadi/customer/{customerId}/grant-payment', name: 'api.ekhadi.grant.payment', methods: ['POST'])]
    public function recordGrantPayment(string $customerId, Request $request, Context $context): JsonResponse
    {
        try {
            $grantAmount  = (float) $request->get('grantAmount', 0);
            $currencyId   = $request->get('currencyId');
            $paymentDateStr = $request->get('paymentDate', date('Y-m-d'));
            $paymentDate  = new \DateTime($paymentDateStr);

            if ($grantAmount <= 0) {
                return new JsonResponse(['success' => false, 'message' => 'Grant amount must be greater than zero.'], 400);
            }

            // 1 & 2: Record the new grant cycle and credit wallet
            $cycleId = $this->grantCycleService->recordGrantPayment(
                $customerId,
                $grantAmount,
                $paymentDate,
                $currencyId,
                $context
            );

            // 3: Auto-repay any outstanding Khadi Credit
            $repaid = $this->repaymentService->processGrantRepayment(
                $customerId,
                $grantAmount,
                $currencyId,
                $context
            );

            // 4: Recompute credit limit based on new repayment history
            $newLimit = $this->areaManager->recomputeCreditLimit($customerId, 100, $context);
            // Override with rules-engine limit (capped at R300)
            $engineLimit = $this->creditRulesEngine->getEligibleLimit($customerId, $context);
            if ($engineLimit > 0) {
                $this->areaManager->upsertCustomerProfile($customerId, ['creditLimit' => $engineLimit], $context);
                $newLimit = $engineLimit;
            }

            return new JsonResponse([
                'success'          => true,
                'cycleId'          => $cycleId,
                'grantAmount'      => $grantAmount,
                'autoRepaid'       => $repaid,
                'netCredited'      => round($grantAmount - $repaid, 2),
                'newCreditLimit'   => $newLimit,
                'message'          => $repaid > 0
                    ? "Grant received. R{$repaid} automatically repaid. R" . round($grantAmount - $repaid, 2) . " loaded."
                    : "Grant of R{$grantAmount} loaded. No outstanding credit.",
            ]);
        } catch (\Exception $e) {
            return new JsonResponse(['success' => false, 'message' => $e->getMessage()], 400);
        }
    }

    /**
     * GET /api/ekhadi/customer/{customerId}/spending-status
     *
     * Returns daily spend velocity, days remaining in cycle, and shortfall risk.
     */
    #[Route(path: '/api/ekhadi/customer/{customerId}/spending-status', name: 'api.ekhadi.grant.spending_status', methods: ['GET'])]
    public function getSpendingStatus(string $customerId, Context $context): JsonResponse
    {
        try {
            $status = $this->grantCycleService->getSpendingStatus($customerId, $context);

            return new JsonResponse(['success' => true, 'status' => $status]);
        } catch (\Exception $e) {
            return new JsonResponse(['success' => false, 'message' => $e->getMessage()], 400);
        }
    }

    /**
     * GET /api/ekhadi/customer/{customerId}/credit-score
     *
     * Returns the behavior-based eligibility assessment and auto-approved limit.
     */
    #[Route(path: '/api/ekhadi/customer/{customerId}/credit-score', name: 'api.ekhadi.grant.credit_score', methods: ['GET'])]
    public function getCreditScore(string $customerId, Context $context): JsonResponse
    {
        try {
            $assessment = $this->creditRulesEngine->assess($customerId, $context);

            return new JsonResponse(['success' => true, 'assessment' => $assessment]);
        } catch (\Exception $e) {
            return new JsonResponse(['success' => false, 'message' => $e->getMessage()], 400);
        }
    }

    /**
     * GET /api/ekhadi/customer/{customerId}/repayment-schedule
     *
     * Returns the customer's pending and historical repayment schedule.
     */
    #[Route(path: '/api/ekhadi/customer/{customerId}/repayment-schedule', name: 'api.ekhadi.grant.repayment_schedule', methods: ['GET'])]
    public function getRepaymentSchedule(string $customerId, Context $context): JsonResponse
    {
        try {
            $pending = $this->repaymentService->getPendingSchedule($customerId, $context);
            $history = $this->repaymentService->getScheduleHistory($customerId, $context);

            return new JsonResponse([
                'success' => true,
                'pending' => $pending ? [
                    'principalOwed'   => $pending->getPrincipalOwed(),
                    'feeAmount'       => $pending->getFeeAmount(),
                    'totalAmountOwed' => $pending->getTotalAmountOwed(),
                    'dueDate'         => $pending->getDueDate()?->format('Y-m-d'),
                ] : null,
                'history' => array_values(array_map(fn ($s) => [
                    'principalOwed'   => $s->getPrincipalOwed(),
                    'feeAmount'       => $s->getFeeAmount(),
                    'totalAmountOwed' => $s->getTotalAmountOwed(),
                    'status'          => $s->getStatus(),
                    'dueDate'         => $s->getDueDate()?->format('Y-m-d'),
                    'processedAt'     => $s->getProcessedAt()?->format('Y-m-d'),
                ], $history)),
            ]);
        } catch (\Exception $e) {
            return new JsonResponse(['success' => false, 'message' => $e->getMessage()], 400);
        }
    }

    /**
     * GET /api/ekhadi/customer/{customerId}/grant-cycles
     */
    #[Route(path: '/api/ekhadi/customer/{customerId}/grant-cycles', name: 'api.ekhadi.grant.cycles', methods: ['GET'])]
    public function getGrantCycles(string $customerId, Request $request, Context $context): JsonResponse
    {
        try {
            $limit  = (int) $request->query->get('limit', 12);
            $cycles = $this->grantCycleService->getCycleHistory($customerId, $limit, $context);

            return new JsonResponse([
                'success' => true,
                'cycles'  => array_values(array_map(fn ($c) => [
                    'grantAmount'        => $c->getGrantAmount(),
                    'paymentDate'        => $c->getPaymentDate()?->format('Y-m-d'),
                    'cycleStart'         => $c->getCycleStart()?->format('Y-m-d'),
                    'cycleEnd'           => $c->getCycleEnd()?->format('Y-m-d'),
                    'amountSpent'        => $c->getAmountSpent(),
                    'shortfallRiskScore' => $c->getShortfallRiskScore(),
                    'status'             => $c->getStatus(),
                ], $cycles)),
            ]);
        } catch (\Exception $e) {
            return new JsonResponse(['success' => false, 'message' => $e->getMessage()], 400);
        }
    }
}
