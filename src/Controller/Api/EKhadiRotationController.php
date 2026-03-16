<?php

namespace EKhadi\Controller\Api;

use Shopware\Core\Framework\Context;
use EKhadi\Service\RotationManager;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

#[Route(defaults: ['_routeScope' => ['api'], '_loginRequired' => true])]
class EKhadiRotationController
{
    public function __construct(
        private readonly RotationManager $rotationManager,
    ) {}

    // POST /api/ekhadi/group/{groupId}/rotation/schedule
    #[Route(path: '/api/ekhadi/group/{groupId}/rotation/schedule', name: 'api.ekhadi.rotation.schedule', methods: ['POST'])]
    public function scheduleRotation(string $groupId, Request $request, Context $context): JsonResponse
    {
        try {
            $startDateStr = $request->get('firstCycleStart', date('Y-m-01'));
            $startDate    = new \DateTime($startDateStr);

            $cycleIds = $this->rotationManager->scheduleRotation($groupId, $startDate, $context);

            return new JsonResponse(['success' => true, 'cyclesCreated' => count($cycleIds), 'cycleIds' => $cycleIds], 201);
        } catch (\Exception $e) {
            return new JsonResponse(['success' => false, 'message' => $e->getMessage()], 400);
        }
    }

    // POST /api/ekhadi/group/{groupId}/rotation/advance
    #[Route(path: '/api/ekhadi/group/{groupId}/rotation/advance', name: 'api.ekhadi.rotation.advance', methods: ['POST'])]
    public function advanceCycle(string $groupId, Context $context): JsonResponse
    {
        try {
            $cycle = $this->rotationManager->advanceCycle($groupId, $context);

            return new JsonResponse([
                'success'               => true,
                'activeCycleId'         => $cycle->getId(),
                'cycleNumber'           => $cycle->getCycleNumber(),
                'beneficiaryCustomerId' => $cycle->getBeneficiaryCustomerId(),
            ]);
        } catch (\Exception $e) {
            return new JsonResponse(['success' => false, 'message' => $e->getMessage()], 400);
        }
    }

    // POST /api/ekhadi/group/{groupId}/rotation/payout
    #[Route(path: '/api/ekhadi/group/{groupId}/rotation/payout', name: 'api.ekhadi.rotation.payout', methods: ['POST'])]
    public function payout(string $groupId, Request $request, Context $context): JsonResponse
    {
        try {
            $amount     = (float) $request->get('amount', 0);
            $currencyId = $request->get('currencyId');

            if ($amount <= 0) {
                return new JsonResponse(['success' => false, 'message' => 'Amount must be greater than zero.'], 400);
            }

            $this->rotationManager->payoutCurrentCycle($groupId, $amount, $currencyId, $context);

            return new JsonResponse(['success' => true, 'message' => 'Payout credited to beneficiary store credit.']);
        } catch (\Exception $e) {
            return new JsonResponse(['success' => false, 'message' => $e->getMessage()], 400);
        }
    }

    // GET /api/ekhadi/group/{groupId}/rotation/cycles
    #[Route(path: '/api/ekhadi/group/{groupId}/rotation/cycles', name: 'api.ekhadi.rotation.cycles', methods: ['GET'])]
    public function listCycles(string $groupId, Context $context): JsonResponse
    {
        try {
            $cycles = $this->rotationManager->listCycles($groupId, $context);

            return new JsonResponse([
                'success' => true,
                'cycles'  => array_values(array_map(fn ($c) => [
                    'id'                    => $c->getId(),
                    'cycleNumber'           => $c->getCycleNumber(),
                    'beneficiaryCustomerId' => $c->getBeneficiaryCustomerId(),
                    'startDate'             => $c->getStartDate()?->format('Y-m-d'),
                    'endDate'               => $c->getEndDate()?->format('Y-m-d'),
                    'status'                => $c->getStatus(),
                    'payoutAmount'          => $c->getPayoutAmount(),
                ], $cycles)),
            ]);
        } catch (\Exception $e) {
            return new JsonResponse(['success' => false, 'message' => $e->getMessage()], 400);
        }
    }

    // PATCH /api/ekhadi/rotation/cycle/{cycleId}/skip
    #[Route(path: '/api/ekhadi/rotation/cycle/{cycleId}/skip', name: 'api.ekhadi.rotation.cycle.skip', methods: ['PATCH'])]
    public function skipCycle(string $cycleId, Context $context): JsonResponse
    {
        try {
            $this->rotationManager->skipCycle($cycleId, $context);

            return new JsonResponse(['success' => true]);
        } catch (\Exception $e) {
            return new JsonResponse(['success' => false, 'message' => $e->getMessage()], 400);
        }
    }

    // GET /api/ekhadi/group/{groupId}/rotation/active
    #[Route(path: '/api/ekhadi/group/{groupId}/rotation/active', name: 'api.ekhadi.rotation.active', methods: ['GET'])]
    public function getActiveCycle(string $groupId, Context $context): JsonResponse
    {
        try {
            $cycle = $this->rotationManager->getActiveCycle($groupId, $context);
            if (!$cycle) {
                return new JsonResponse(['success' => true, 'activeCycle' => null]);
            }

            return new JsonResponse([
                'success' => true,
                'activeCycle' => [
                    'id'                    => $cycle->getId(),
                    'cycleNumber'           => $cycle->getCycleNumber(),
                    'beneficiaryCustomerId' => $cycle->getBeneficiaryCustomerId(),
                    'startDate'             => $cycle->getStartDate()?->format('Y-m-d'),
                    'endDate'               => $cycle->getEndDate()?->format('Y-m-d'),
                    'payoutAmount'          => $cycle->getPayoutAmount(),
                ],
            ]);
        } catch (\Exception $e) {
            return new JsonResponse(['success' => false, 'message' => $e->getMessage()], 400);
        }
    }
}
