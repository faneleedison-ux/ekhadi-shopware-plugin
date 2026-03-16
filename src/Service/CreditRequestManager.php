<?php

namespace EKhadi\Service;

use Shopware\Core\Framework\Context;
use Shopware\Core\Framework\DataAbstractionLayer\EntityRepository;
use Shopware\Core\Framework\DataAbstractionLayer\Search\Criteria;
use Shopware\Core\Framework\DataAbstractionLayer\Search\Filter\EqualsFilter;
use Shopware\Core\Framework\DataAbstractionLayer\Search\Filter\MultiFilter;
use Shopware\Core\Framework\DataAbstractionLayer\Search\Sorting\FieldSorting;
use Shopware\Core\Framework\Uuid\Uuid;
use EKhadi\Core\Content\EKhadi\CreditRequest\EKhadiCreditRequestEntity;

class CreditRequestManager
{
    public const STATUS_PENDING  = 'pending';
    public const STATUS_APPROVED = 'approved';
    public const STATUS_REJECTED = 'rejected';
    public const STATUS_REPAID   = 'repaid';

    public function __construct(
        private readonly EntityRepository $requestRepository,
        private readonly GroupManager $groupManager,
        private readonly GroupWalletManager $walletManager,
        private readonly StoreCreditManager $storeCreditManager,
        private readonly CreditRulesEngine $creditRulesEngine,
        private readonly RepaymentService $repaymentService,
    ) {}

    /**
     * A member submits a mid-month credit request against their group's bucket.
     */
    public function submitRequest(
        string $customerId,
        string $bucketType,
        float $amount,
        ?string $reason,
        ?\DateTimeInterface $repaymentDate,
        int $requiredApprovals,
        Context $context
    ): string {
        $groupId = $this->groupManager->getMemberGroupId($customerId, $context);
        if (!$groupId) {
            throw new \RuntimeException("Customer $customerId is not an active member of any group.");
        }

        // Check credit rules engine — behavior-based eligibility, R50–R300 limit
        $eligibility = $this->creditRulesEngine->canBorrow($customerId, $amount, $context);
        if (!$eligibility['allowed']) {
            throw new \RuntimeException($eligibility['reason']);
        }

        // Verify the bucket has sufficient balance
        $bucket = $this->walletManager->getMemberBucket($customerId, $bucketType, $context);
        if (!$bucket) {
            throw new \RuntimeException("Bucket '$bucketType' not found for group $groupId.");
        }

        if ($bucket->getBalance() < $amount) {
            throw new \RuntimeException("Insufficient balance in bucket '$bucketType'. Available: " . $bucket->getBalance());
        }

        $requestId = Uuid::randomHex();
        $this->requestRepository->create([[
            'id'                    => $requestId,
            'groupId'               => $groupId,
            'requesterCustomerId'   => $customerId,
            'bucketType'            => $bucketType,
            'amount'                => $amount,
            'reason'                => $reason,
            'status'                => self::STATUS_PENDING,
            'approvalsCount'        => 0,
            'requiredApprovals'     => $requiredApprovals,
            'approvedBy'            => [],
            'repaymentDate'         => $repaymentDate?->format('Y-m-d H:i:s.u'),
            'createdAt'             => (new \DateTime())->format('Y-m-d H:i:s.u'),
        ]], $context);

        return $requestId;
    }

    /**
     * An admin or fellow member approves a pending request.
     * When required approvals are reached the request is auto-approved and credit disbursed.
     */
    public function approveRequest(string $requestId, string $approvingCustomerId, Context $context): EKhadiCreditRequestEntity
    {
        $request = $this->getRequest($requestId, $context);
        if (!$request) {
            throw new \RuntimeException("Credit request $requestId not found.");
        }

        if ($request->getStatus() !== self::STATUS_PENDING) {
            throw new \RuntimeException("Request is not in pending status (current: {$request->getStatus()}).");
        }

        if ($approvingCustomerId === $request->getRequesterCustomerId()) {
            throw new \RuntimeException("Requester cannot approve their own request.");
        }

        $approvedBy = $request->getApprovedBy() ?? [];
        if (in_array($approvingCustomerId, $approvedBy, true)) {
            throw new \RuntimeException("Customer $approvingCustomerId has already approved this request.");
        }

        $approvedBy[] = $approvingCustomerId;
        $newCount = count($approvedBy);

        $updateData = [
            'id'             => $requestId,
            'approvedBy'     => $approvedBy,
            'approvalsCount' => $newCount,
            'updatedAt'      => (new \DateTime())->format('Y-m-d H:i:s'),
        ];

        if ($newCount >= $request->getRequiredApprovals()) {
            $updateData['status'] = self::STATUS_APPROVED;

            // Disburse: deduct from bucket, credit requester's personal store credit
            $this->walletManager->deductFromBucket(
                $request->getGroupId(),
                $request->getBucketType(),
                $request->getAmount(),
                $context
            );

            $this->storeCreditManager->addCredit(
                $request->getRequesterCustomerId(),
                null,
                null,
                $request->getAmount(),
                $context,
                "Mid-month credit request approved (bucket: {$request->getBucketType()})"
            );

            // Schedule automatic repayment from next grant (principal + flat fee, no compound interest)
            $this->repaymentService->addToSchedule(
                $request->getRequesterCustomerId(),
                $request->getAmount(),
                $requestId,
                $context
            );
        }

        $this->requestRepository->update([$updateData], $context);

        return $this->getRequest($requestId, $context);
    }

    /**
     * Reject a pending request.
     */
    public function rejectRequest(string $requestId, Context $context): void
    {
        $request = $this->getRequest($requestId, $context);
        if (!$request || $request->getStatus() !== self::STATUS_PENDING) {
            throw new \RuntimeException("Request $requestId is not pending.");
        }

        $this->requestRepository->update([[
            'id'        => $requestId,
            'status'    => self::STATUS_REJECTED,
            'updatedAt' => (new \DateTime())->format('Y-m-d H:i:s'),
        ]], $context);
    }

    /**
     * Mark a previously approved request as repaid.
     */
    public function markRepaid(string $requestId, Context $context): void
    {
        $request = $this->getRequest($requestId, $context);
        if (!$request || $request->getStatus() !== self::STATUS_APPROVED) {
            throw new \RuntimeException("Request $requestId is not in approved status.");
        }

        // Repayment: deduct from requester's store credit and put funds back in bucket
        $historyId = $this->storeCreditManager->deductCredit(
            $request->getRequesterCustomerId(),
            $request->getAmount(),
            $context,
            null,
            null,
            "Repayment of mid-month credit request (bucket: {$request->getBucketType()})"
        );
        if ($historyId === null) {
            throw new \RuntimeException('Insufficient store credit balance to repay this request.');
        }

        $this->walletManager->creditBucket(
            $request->getGroupId(),
            $request->getBucketType(),
            $request->getAmount(),
            $context
        );

        $this->requestRepository->update([[
            'id'        => $requestId,
            'status'    => self::STATUS_REPAID,
            'repaidAt'  => (new \DateTime())->format('Y-m-d H:i:s.u'),
            'updatedAt' => (new \DateTime())->format('Y-m-d H:i:s'),
        ]], $context);
    }

    public function getRequest(string $requestId, Context $context): ?EKhadiCreditRequestEntity
    {
        $criteria = new Criteria([$requestId]);
        return $this->requestRepository->search($criteria, $context)->first();
    }

    public function listGroupRequests(string $groupId, ?string $status, Context $context): array
    {
        $criteria = new Criteria();
        $filters = [new EqualsFilter('groupId', $groupId)];
        if ($status !== null) {
            $filters[] = new EqualsFilter('status', $status);
        }
        $criteria->addFilter(new MultiFilter(MultiFilter::CONNECTION_AND, $filters));
        $criteria->addSorting(new FieldSorting('createdAt', FieldSorting::DESCENDING));

        return $this->requestRepository->search($criteria, $context)->getElements();
    }

    public function listCustomerRequests(string $customerId, Context $context): array
    {
        $criteria = new Criteria();
        $criteria->addFilter(new EqualsFilter('requesterCustomerId', $customerId));
        $criteria->addSorting(new FieldSorting('createdAt', FieldSorting::DESCENDING));

        return $this->requestRepository->search($criteria, $context)->getElements();
    }
}
