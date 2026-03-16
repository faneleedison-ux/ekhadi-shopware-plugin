<?php

namespace EKhadi\Core\Content\EKhadi\GroupMember;

use Shopware\Core\Framework\DataAbstractionLayer\Entity;
use Shopware\Core\Framework\DataAbstractionLayer\EntityIdTrait;

class EKhadiGroupMemberEntity extends Entity
{
    use EntityIdTrait;

    protected string $groupId;
    protected string $customerId;
    protected string $role = 'member';
    protected string $status = 'active';
    protected ?\DateTimeInterface $joinDate = null;
    protected float $monthlyCommitment = 0.00;

    public function getGroupId(): string { return $this->groupId; }
    public function setGroupId(string $groupId): void { $this->groupId = $groupId; }

    public function getCustomerId(): string { return $this->customerId; }
    public function setCustomerId(string $customerId): void { $this->customerId = $customerId; }

    public function getRole(): string { return $this->role; }
    public function setRole(string $role): void { $this->role = $role; }

    public function getStatus(): string { return $this->status; }
    public function setStatus(string $status): void { $this->status = $status; }

    public function getJoinDate(): ?\DateTimeInterface { return $this->joinDate; }
    public function setJoinDate(?\DateTimeInterface $joinDate): void { $this->joinDate = $joinDate; }

    public function getMonthlyCommitment(): float { return $this->monthlyCommitment; }
    public function setMonthlyCommitment(float $monthlyCommitment): void { $this->monthlyCommitment = $monthlyCommitment; }
}
