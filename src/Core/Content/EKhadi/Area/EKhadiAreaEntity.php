<?php

namespace EKhadi\Core\Content\EKhadi\Area;

use Shopware\Core\Framework\DataAbstractionLayer\Entity;
use Shopware\Core\Framework\DataAbstractionLayer\EntityIdTrait;

class EKhadiAreaEntity extends Entity
{
    use EntityIdTrait;

    protected string $name;
    protected ?string $description = null;
    protected ?string $province = null;

    public function getName(): string { return $this->name; }
    public function setName(string $name): void { $this->name = $name; }

    public function getDescription(): ?string { return $this->description; }
    public function setDescription(?string $description): void { $this->description = $description; }

    public function getProvince(): ?string { return $this->province; }
    public function setProvince(?string $province): void { $this->province = $province; }
}
