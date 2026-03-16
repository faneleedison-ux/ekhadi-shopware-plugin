<?php

namespace EKhadi\Core\Content\EKhadi\GroupBucket;

use Shopware\Core\Framework\DataAbstractionLayer\Entity;
use Shopware\Core\Framework\DataAbstractionLayer\EntityIdTrait;

class EKhadiGroupBucketEntity extends Entity
{
    use EntityIdTrait;

    protected string $walletId;
    protected string $bucketType;
    protected float $balance = 0.00;
    /** @var string[]|null */
    protected ?array $allowedCategories = null;

    public function getWalletId(): string { return $this->walletId; }
    public function setWalletId(string $walletId): void { $this->walletId = $walletId; }

    public function getBucketType(): string { return $this->bucketType; }
    public function setBucketType(string $bucketType): void { $this->bucketType = $bucketType; }

    public function getBalance(): float { return $this->balance; }
    public function setBalance(float $balance): void { $this->balance = $balance; }

    public function getAllowedCategories(): ?array { return $this->allowedCategories; }
    public function setAllowedCategories(?array $allowedCategories): void { $this->allowedCategories = $allowedCategories; }
}
