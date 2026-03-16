<?php

namespace EKhadi\Core\Content\EKhadi\RotationCycle;

use Shopware\Core\Checkout\Customer\CustomerDefinition;
use Shopware\Core\Framework\DataAbstractionLayer\EntityDefinition;
use Shopware\Core\Framework\DataAbstractionLayer\Field\DateTimeField;
use Shopware\Core\Framework\DataAbstractionLayer\Field\FkField;
use Shopware\Core\Framework\DataAbstractionLayer\Field\Flag\PrimaryKey;
use Shopware\Core\Framework\DataAbstractionLayer\Field\Flag\Required;
use Shopware\Core\Framework\DataAbstractionLayer\Field\FloatField;
use Shopware\Core\Framework\DataAbstractionLayer\Field\IdField;
use Shopware\Core\Framework\DataAbstractionLayer\Field\IntField;
use Shopware\Core\Framework\DataAbstractionLayer\Field\ManyToOneAssociationField;
use Shopware\Core\Framework\DataAbstractionLayer\Field\StringField;
use Shopware\Core\Framework\DataAbstractionLayer\FieldCollection;
use EKhadi\Core\Content\EKhadi\Group\EKhadiGroupDefinition;

class EKhadiRotationCycleDefinition extends EntityDefinition
{
    public function getEntityName(): string
    {
        return 'ekhadi_rotation_cycle';
    }

    public function getEntityClass(): string
    {
        return EKhadiRotationCycleEntity::class;
    }

    public function getCollectionClass(): string
    {
        return EKhadiRotationCycleCollection::class;
    }

    protected function defineFields(): FieldCollection
    {
        return new FieldCollection([
            (new IdField('id', 'id'))->addFlags(new PrimaryKey(), new Required()),
            (new FkField('group_id', 'groupId', EKhadiGroupDefinition::class, 'id'))->addFlags(new Required()),
            (new IntField('cycle_number', 'cycleNumber'))->addFlags(new Required()),
            (new FkField('beneficiary_customer_id', 'beneficiaryCustomerId', CustomerDefinition::class, 'id'))->addFlags(new Required()),
            (new DateTimeField('start_date', 'startDate'))->addFlags(new Required()),
            (new DateTimeField('end_date', 'endDate'))->addFlags(new Required()),
            (new StringField('status', 'status'))->addFlags(new Required()),
            (new FloatField('payout_amount', 'payoutAmount'))->addFlags(new Required()),
            (new DateTimeField('created_at', 'createdAt'))->addFlags(new Required()),
            new DateTimeField('updated_at', 'updatedAt'),

            new ManyToOneAssociationField('group', 'group_id', EKhadiGroupDefinition::class, 'id'),
            new ManyToOneAssociationField('beneficiaryCustomer', 'beneficiary_customer_id', CustomerDefinition::class, 'id'),
        ]);
    }
}
