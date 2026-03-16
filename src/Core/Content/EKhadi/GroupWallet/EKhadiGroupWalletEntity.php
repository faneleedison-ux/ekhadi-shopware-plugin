<?php

namespace EKhadi\Core\Content\EKhadi\GroupWallet;

use Shopware\Core\Framework\DataAbstractionLayer\Entity;
use Shopware\Core\Framework\DataAbstractionLayer\EntityIdTrait;
use EKhadi\Core\Content\EKhadi\GroupBucket\EKhadiGroupBucketCollection;

class EKhadiGroupWalletEntity extends Entity
{
    use EntityIdTrait;

    protected string $groupId;
    protected float $balance = 0.00;
    protected ?string $currencyId = null;
    protected ?EKhadiGroupBucketCollection $buckets = null;

    public function getGroupId(): string { return $this->groupId; }
    public function setGroupId(string $groupId): void { $this->groupId = $groupId; }

    public function getBalance(): float { return $this->balance; }
    public function setBalance(float $balance): void { $this->balance = $balance; }

    public function getCurrencyId(): ?string { return $this->currencyId; }
    public function setCurrencyId(?string $currencyId): void { $this->currencyId = $currencyId; }

    public function getBuckets(): ?EKhadiGroupBucketCollection { return $this->buckets; }
    public function setBuckets(?EKhadiGroupBucketCollection $buckets): void { $this->buckets = $buckets; }
}
