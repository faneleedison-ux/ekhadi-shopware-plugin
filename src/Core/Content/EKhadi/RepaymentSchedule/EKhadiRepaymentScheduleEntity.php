<?php

namespace EKhadi\Core\Content\EKhadi\RepaymentSchedule;

use Shopware\Core\Framework\DataAbstractionLayer\Entity;
use Shopware\Core\Framework\DataAbstractionLayer\EntityIdTrait;

class EKhadiRepaymentScheduleEntity extends Entity
{
    use EntityIdTrait;

    protected string $customerId;
    protected float $principalOwed = 0.00;
    protected float $feeAmount = 0.00;
    protected float $totalAmountOwed = 0.00;
    protected ?\DateTimeInterface $dueDate = null;
    protected string $status = 'pending';
    /** @var string[]|null */
    protected ?array $creditRequestIds = null;
    protected ?\DateTimeInterface $processedAt = null;

    public function getCustomerId(): string { return $this->customerId; }
    public function setCustomerId(string $customerId): void { $this->customerId = $customerId; }

    public function getPrincipalOwed(): float { return $this->principalOwed; }
    public function setPrincipalOwed(float $principalOwed): void { $this->principalOwed = $principalOwed; }

    public function getFeeAmount(): float { return $this->feeAmount; }
    public function setFeeAmount(float $feeAmount): void { $this->feeAmount = $feeAmount; }

    public function getTotalAmountOwed(): float { return $this->totalAmountOwed; }
    public function setTotalAmountOwed(float $totalAmountOwed): void { $this->totalAmountOwed = $totalAmountOwed; }

    public function getDueDate(): ?\DateTimeInterface { return $this->dueDate; }
    public function setDueDate(?\DateTimeInterface $dueDate): void { $this->dueDate = $dueDate; }

    public function getStatus(): string { return $this->status; }
    public function setStatus(string $status): void { $this->status = $status; }

    public function getCreditRequestIds(): ?array { return $this->creditRequestIds; }
    public function setCreditRequestIds(?array $creditRequestIds): void { $this->creditRequestIds = $creditRequestIds; }

    public function getProcessedAt(): ?\DateTimeInterface { return $this->processedAt; }
    public function setProcessedAt(?\DateTimeInterface $processedAt): void { $this->processedAt = $processedAt; }
}
