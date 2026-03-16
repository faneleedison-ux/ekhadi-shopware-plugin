<?php

namespace EKhadi\Core\Content\EKhadi\GrantCycle;

use Shopware\Core\Framework\DataAbstractionLayer\Entity;
use Shopware\Core\Framework\DataAbstractionLayer\EntityIdTrait;

class EKhadiGrantCycleEntity extends Entity
{
    use EntityIdTrait;

    protected string $customerId;
    protected float $grantAmount;
    protected ?\DateTimeInterface $paymentDate = null;
    protected ?\DateTimeInterface $cycleStart = null;
    protected ?\DateTimeInterface $cycleEnd = null;
    protected float $amountSpent = 0.00;
    protected int $shortfallRiskScore = 0;
    protected string $status = 'active';

    public function getCustomerId(): string { return $this->customerId; }
    public function setCustomerId(string $customerId): void { $this->customerId = $customerId; }

    public function getGrantAmount(): float { return $this->grantAmount; }
    public function setGrantAmount(float $grantAmount): void { $this->grantAmount = $grantAmount; }

    public function getPaymentDate(): ?\DateTimeInterface { return $this->paymentDate; }
    public function setPaymentDate(?\DateTimeInterface $paymentDate): void { $this->paymentDate = $paymentDate; }

    public function getCycleStart(): ?\DateTimeInterface { return $this->cycleStart; }
    public function setCycleStart(?\DateTimeInterface $cycleStart): void { $this->cycleStart = $cycleStart; }

    public function getCycleEnd(): ?\DateTimeInterface { return $this->cycleEnd; }
    public function setCycleEnd(?\DateTimeInterface $cycleEnd): void { $this->cycleEnd = $cycleEnd; }

    public function getAmountSpent(): float { return $this->amountSpent; }
    public function setAmountSpent(float $amountSpent): void { $this->amountSpent = $amountSpent; }

    public function getShortfallRiskScore(): int { return $this->shortfallRiskScore; }
    public function setShortfallRiskScore(int $shortfallRiskScore): void { $this->shortfallRiskScore = $shortfallRiskScore; }

    public function getStatus(): string { return $this->status; }
    public function setStatus(string $status): void { $this->status = $status; }
}
