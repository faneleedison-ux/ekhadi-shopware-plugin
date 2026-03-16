<?php

namespace EKhadi\Controller\Api;

use Shopware\Core\Framework\Context;
use EKhadi\Service\CreditRequestManager;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

#[Route(defaults: ['_routeScope' => ['api'], '_loginRequired' => true])]
class EKhadiCreditRequestController
{
    public function __construct(
        private readonly CreditRequestManager $creditRequestManager,
    ) {}

    // POST /api/ekhadi/credit-request
    #[Route(path: '/api/ekhadi/credit-request', name: 'api.ekhadi.credit_request.submit', methods: ['POST'])]
    public function submitRequest(Request $request, Context $context): JsonResponse
    {
        try {
            $repaymentDateStr = $request->get('repaymentDate');
            $repaymentDate    = $repaymentDateStr ? new \DateTime($repaymentDateStr) : null;

            $requestId = $this->creditRequestManager->submitRequest(
                $request->get('customerId', ''),
                $request->get('bucketType', ''),
                (float) $request->get('amount', 0),
                $request->get('reason'),
                $repaymentDate,
                (int) $request->get('requiredApprovals', 2),
                $context
            );

            return new JsonResponse(['success' => true, 'requestId' => $requestId], 201);
        } catch (\Exception $e) {
            return new JsonResponse(['success' => false, 'message' => $e->getMessage()], 400);
        }
    }

    // POST /api/ekhadi/credit-request/{requestId}/approve
    #[Route(path: '/api/ekhadi/credit-request/{requestId}/approve', name: 'api.ekhadi.credit_request.approve', methods: ['POST'])]
    public function approveRequest(string $requestId, Request $request, Context $context): JsonResponse
    {
        try {
            $updatedRequest = $this->creditRequestManager->approveRequest(
                $requestId,
                $request->get('approvingCustomerId', ''),
                $context
            );

            return new JsonResponse([
                'success'        => true,
                'status'         => $updatedRequest->getStatus(),
                'approvalsCount' => $updatedRequest->getApprovalsCount(),
            ]);
        } catch (\Exception $e) {
            return new JsonResponse(['success' => false, 'message' => $e->getMessage()], 400);
        }
    }

    // POST /api/ekhadi/credit-request/{requestId}/reject
    #[Route(path: '/api/ekhadi/credit-request/{requestId}/reject', name: 'api.ekhadi.credit_request.reject', methods: ['POST'])]
    public function rejectRequest(string $requestId, Context $context): JsonResponse
    {
        try {
            $this->creditRequestManager->rejectRequest($requestId, $context);

            return new JsonResponse(['success' => true]);
        } catch (\Exception $e) {
            return new JsonResponse(['success' => false, 'message' => $e->getMessage()], 400);
        }
    }

    // POST /api/ekhadi/credit-request/{requestId}/repay
    #[Route(path: '/api/ekhadi/credit-request/{requestId}/repay', name: 'api.ekhadi.credit_request.repay', methods: ['POST'])]
    public function markRepaid(string $requestId, Context $context): JsonResponse
    {
        try {
            $this->creditRequestManager->markRepaid($requestId, $context);

            return new JsonResponse(['success' => true]);
        } catch (\Exception $e) {
            return new JsonResponse(['success' => false, 'message' => $e->getMessage()], 400);
        }
    }

    // GET /api/ekhadi/group/{groupId}/credit-requests
    #[Route(path: '/api/ekhadi/group/{groupId}/credit-requests', name: 'api.ekhadi.credit_request.list_group', methods: ['GET'])]
    public function listGroupRequests(string $groupId, Request $request, Context $context): JsonResponse
    {
        try {
            $status   = $request->query->get('status');
            $requests = $this->creditRequestManager->listGroupRequests($groupId, $status, $context);

            return new JsonResponse([
                'success'  => true,
                'requests' => array_values(array_map(fn ($r) => [
                    'id'                    => $r->getId(),
                    'requesterCustomerId'   => $r->getRequesterCustomerId(),
                    'bucketType'            => $r->getBucketType(),
                    'amount'                => $r->getAmount(),
                    'reason'                => $r->getReason(),
                    'status'                => $r->getStatus(),
                    'approvalsCount'        => $r->getApprovalsCount(),
                    'requiredApprovals'     => $r->getRequiredApprovals(),
                    'repaymentDate'         => $r->getRepaymentDate()?->format('Y-m-d'),
                    'repaidAt'              => $r->getRepaidAt()?->format('Y-m-d H:i:s'),
                ], $requests)),
            ]);
        } catch (\Exception $e) {
            return new JsonResponse(['success' => false, 'message' => $e->getMessage()], 400);
        }
    }

    // GET /api/ekhadi/customer/{customerId}/credit-requests
    #[Route(path: '/api/ekhadi/customer/{customerId}/credit-requests', name: 'api.ekhadi.credit_request.list_customer', methods: ['GET'])]
    public function listCustomerRequests(string $customerId, Context $context): JsonResponse
    {
        try {
            $requests = $this->creditRequestManager->listCustomerRequests($customerId, $context);

            return new JsonResponse([
                'success'  => true,
                'requests' => array_values(array_map(fn ($r) => [
                    'id'                => $r->getId(),
                    'groupId'           => $r->getGroupId(),
                    'bucketType'        => $r->getBucketType(),
                    'amount'            => $r->getAmount(),
                    'status'            => $r->getStatus(),
                    'repaymentDate'     => $r->getRepaymentDate()?->format('Y-m-d'),
                ], $requests)),
            ]);
        } catch (\Exception $e) {
            return new JsonResponse(['success' => false, 'message' => $e->getMessage()], 400);
        }
    }
}
