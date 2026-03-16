<?php

namespace EKhadi\Core\Content\EKhadi\RotationCycle;

use Shopware\Core\Framework\DataAbstractionLayer\Entity;
use Shopware\Core\Framework\DataAbstractionLayer\EntityIdTrait;

class EKhadiRotationCycleEntity extends Entity
{
    use EntityIdTrait;

    protected string $groupId;
    protected int $cycleNumber;
    protected string $beneficiaryCustomerId;
    protected ?\DateTimeInterface $startDate = null;
    protected ?\DateTimeInterface $endDate = null;
    protected string $status = 'pending';
    protected float $payoutAmount = 0.00;

    public function getGroupId(): string { return $this->groupId; }
    public function setGroupId(string $groupId): void { $this->groupId = $groupId; }

    public function getCycleNumber(): int { return $this->cycleNumber; }
    public function setCycleNumber(int $cycleNumber): void { $this->cycleNumber = $cycleNumber; }

    public function getBeneficiaryCustomerId(): string { return $this->beneficiaryCustomerId; }
    public function setBeneficiaryCustomerId(string $beneficiaryCustomerId): void { $this->beneficiaryCustomerId = $beneficiaryCustomerId; }

    public function getStartDate(): ?\DateTimeInterface { return $this->startDate; }
    public function setStartDate(?\DateTimeInterface $startDate): void { $this->startDate = $startDate; }

    public function getEndDate(): ?\DateTimeInterface { return $this->endDate; }
    public function setEndDate(?\DateTimeInterface $endDate): void { $this->endDate = $endDate; }

    public function getStatus(): string { return $this->status; }
    public function setStatus(string $status): void { $this->status = $status; }

    public function getPayoutAmount(): float { return $this->payoutAmount; }
    public function setPayoutAmount(float $payoutAmount): void { $this->payoutAmount = $payoutAmount; }
}
