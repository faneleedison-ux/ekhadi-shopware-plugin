<?php

namespace EKhadi\Core\Content\EKhadi\AreaShop;

use Shopware\Core\Framework\DataAbstractionLayer\Entity;
use Shopware\Core\Framework\DataAbstractionLayer\EntityIdTrait;

class EKhadiAreaShopEntity extends Entity
{
    use EntityIdTrait;

    protected string $areaId;
    protected string $salesChannelId;

    public function getAreaId(): string { return $this->areaId; }
    public function setAreaId(string $areaId): void { $this->areaId = $areaId; }

    public function getSalesChannelId(): string { return $this->salesChannelId; }
    public function setSalesChannelId(string $salesChannelId): void { $this->salesChannelId = $salesChannelId; }
}
