<?php

namespace EKhadi\Core\Content\EKhadi\CustomerProfile;

use Shopware\Core\Framework\DataAbstractionLayer\Entity;
use Shopware\Core\Framework\DataAbstractionLayer\EntityIdTrait;

class EKhadiCustomerProfileEntity extends Entity
{
    use EntityIdTrait;

    protected string $customerId;
    protected ?string $areaId = null;
    protected bool $isGrantRecipient = true;
    protected float $grantAmount = 0.00;
    protected int $grantPayDay = 1;
    protected float $creditLimit = 0.00;

    public function getCustomerId(): string { return $this->customerId; }
    public function setCustomerId(string $customerId): void { $this->customerId = $customerId; }

    public function getAreaId(): ?string { return $this->areaId; }
    public function setAreaId(?string $areaId): void { $this->areaId = $areaId; }

    public function isGrantRecipient(): bool { return $this->isGrantRecipient; }
    public function setIsGrantRecipient(bool $isGrantRecipient): void { $this->isGrantRecipient = $isGrantRecipient; }

    public function getGrantAmount(): float { return $this->grantAmount; }
    public function setGrantAmount(float $grantAmount): void { $this->grantAmount = $grantAmount; }

    public function getGrantPayDay(): int { return $this->grantPayDay; }
    public function setGrantPayDay(int $grantPayDay): void { $this->grantPayDay = $grantPayDay; }

    public function getCreditLimit(): float { return $this->creditLimit; }
    public function setCreditLimit(float $creditLimit): void { $this->creditLimit = $creditLimit; }
}
