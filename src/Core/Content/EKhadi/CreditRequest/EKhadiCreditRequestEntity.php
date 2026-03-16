<?php

namespace EKhadi\Core\Content\EKhadi\CreditRequest;

use Shopware\Core\Framework\DataAbstractionLayer\Entity;
use Shopware\Core\Framework\DataAbstractionLayer\EntityIdTrait;

class EKhadiCreditRequestEntity extends Entity
{
    use EntityIdTrait;

    protected string $groupId;
    protected string $requesterCustomerId;
    protected string $bucketType;
    protected float $amount;
    protected ?string $reason = null;
    protected string $status = 'pending';
    protected int $approvalsCount = 0;
    protected int $requiredApprovals = 2;
    /** @var string[]|null */
    protected ?array $approvedBy = null;
    protected ?\DateTimeInterface $repaymentDate = null;
    protected ?\DateTimeInterface $repaidAt = null;

    public function getGroupId(): string { return $this->groupId; }
    public function setGroupId(string $groupId): void { $this->groupId = $groupId; }

    public function getRequesterCustomerId(): string { return $this->requesterCustomerId; }
    public function setRequesterCustomerId(string $requesterCustomerId): void { $this->requesterCustomerId = $requesterCustomerId; }

    public function getBucketType(): string { return $this->bucketType; }
    public function setBucketType(string $bucketType): void { $this->bucketType = $bucketType; }

    public function getAmount(): float { return $this->amount; }
    public function setAmount(float $amount): void { $this->amount = $amount; }

    public function getReason(): ?string { return $this->reason; }
    public function setReason(?string $reason): void { $this->reason = $reason; }

    public function getStatus(): string { return $this->status; }
    public function setStatus(string $status): void { $this->status = $status; }

    public function getApprovalsCount(): int { return $this->approvalsCount; }
    public function setApprovalsCount(int $approvalsCount): void { $this->approvalsCount = $approvalsCount; }

    public function getRequiredApprovals(): int { return $this->requiredApprovals; }
    public function setRequiredApprovals(int $requiredApprovals): void { $this->requiredApprovals = $requiredApprovals; }

    public function getApprovedBy(): ?array { return $this->approvedBy; }
    public function setApprovedBy(?array $approvedBy): void { $this->approvedBy = $approvedBy; }

    public function getRepaymentDate(): ?\DateTimeInterface { return $this->repaymentDate; }
    public function setRepaymentDate(?\DateTimeInterface $repaymentDate): void { $this->repaymentDate = $repaymentDate; }

    public function getRepaidAt(): ?\DateTimeInterface { return $this->repaidAt; }
    public function setRepaidAt(?\DateTimeInterface $repaidAt): void { $this->repaidAt = $repaidAt; }
}
