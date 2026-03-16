<?php

namespace EKhadi\Core\Content\EKhadi\Group;

use Shopware\Core\Framework\DataAbstractionLayer\Entity;
use Shopware\Core\Framework\DataAbstractionLayer\EntityIdTrait;

class EKhadiGroupEntity extends Entity
{
    use EntityIdTrait;

    protected string $name;
    protected ?string $description = null;
    protected string $status = 'active';
    protected int $maxMembers = 20;
    protected int $contributionDay = 1;
    protected ?string $currencyId = null;
    protected ?string $areaId = null;

    public function getName(): string { return $this->name; }
    public function setName(string $name): void { $this->name = $name; }

    public function getDescription(): ?string { return $this->description; }
    public function setDescription(?string $description): void { $this->description = $description; }

    public function getStatus(): string { return $this->status; }
    public function setStatus(string $status): void { $this->status = $status; }

    public function getMaxMembers(): int { return $this->maxMembers; }
    public function setMaxMembers(int $maxMembers): void { $this->maxMembers = $maxMembers; }

    public function getContributionDay(): int { return $this->contributionDay; }
    public function setContributionDay(int $contributionDay): void { $this->contributionDay = $contributionDay; }

    public function getCurrencyId(): ?string { return $this->currencyId; }
    public function setCurrencyId(?string $currencyId): void { $this->currencyId = $currencyId; }

    public function getAreaId(): ?string { return $this->areaId; }
    public function setAreaId(?string $areaId): void { $this->areaId = $areaId; }
}
