<?php

namespace EKhadi\Core\Content\EKhadi\GroupMember;

use Shopware\Core\Checkout\Customer\CustomerDefinition;
use Shopware\Core\Framework\DataAbstractionLayer\EntityDefinition;
use Shopware\Core\Framework\DataAbstractionLayer\Field\DateTimeField;
use Shopware\Core\Framework\DataAbstractionLayer\Field\FkField;
use Shopware\Core\Framework\DataAbstractionLayer\Field\Flag\PrimaryKey;
use Shopware\Core\Framework\DataAbstractionLayer\Field\Flag\Required;
use Shopware\Core\Framework\DataAbstractionLayer\Field\FloatField;
use Shopware\Core\Framework\DataAbstractionLayer\Field\IdField;
use Shopware\Core\Framework\DataAbstractionLayer\Field\ManyToOneAssociationField;
use Shopware\Core\Framework\DataAbstractionLayer\Field\StringField;
use Shopware\Core\Framework\DataAbstractionLayer\FieldCollection;
use EKhadi\Core\Content\EKhadi\Group\EKhadiGroupDefinition;

class EKhadiGroupMemberDefinition extends EntityDefinition
{
    public function getEntityName(): string
    {
        return 'ekhadi_group_member';
    }

    public function getEntityClass(): string
    {
        return EKhadiGroupMemberEntity::class;
    }

    public function getCollectionClass(): string
    {
        return EKhadiGroupMemberCollection::class;
    }

    protected function defineFields(): FieldCollection
    {
        return new FieldCollection([
            (new IdField('id', 'id'))->addFlags(new PrimaryKey(), new Required()),
            (new FkField('group_id', 'groupId', EKhadiGroupDefinition::class, 'id'))->addFlags(new Required()),
            (new FkField('customer_id', 'customerId', CustomerDefinition::class, 'id'))->addFlags(new Required()),
            (new StringField('role', 'role'))->addFlags(new Required()),
            (new StringField('status', 'status'))->addFlags(new Required()),
            (new DateTimeField('join_date', 'joinDate'))->addFlags(new Required()),
            (new FloatField('monthly_commitment', 'monthlyCommitment'))->addFlags(new Required()),
            (new DateTimeField('created_at', 'createdAt'))->addFlags(new Required()),
            new DateTimeField('updated_at', 'updatedAt'),

            new ManyToOneAssociationField('group', 'group_id', EKhadiGroupDefinition::class, 'id'),
            new ManyToOneAssociationField('customer', 'customer_id', CustomerDefinition::class, 'id'),
        ]);
    }
}
