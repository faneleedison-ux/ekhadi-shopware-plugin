<?php

namespace EKhadi\Core\Content\EKhadi\CustomerProfile;

use Shopware\Core\Checkout\Customer\CustomerDefinition;
use Shopware\Core\Framework\DataAbstractionLayer\EntityDefinition;
use Shopware\Core\Framework\DataAbstractionLayer\Field\BoolField;
use Shopware\Core\Framework\DataAbstractionLayer\Field\DateTimeField;
use Shopware\Core\Framework\DataAbstractionLayer\Field\FkField;
use Shopware\Core\Framework\DataAbstractionLayer\Field\Flag\PrimaryKey;
use Shopware\Core\Framework\DataAbstractionLayer\Field\Flag\Required;
use Shopware\Core\Framework\DataAbstractionLayer\Field\FloatField;
use Shopware\Core\Framework\DataAbstractionLayer\Field\IdField;
use Shopware\Core\Framework\DataAbstractionLayer\Field\IntField;
use Shopware\Core\Framework\DataAbstractionLayer\Field\ManyToOneAssociationField;
use Shopware\Core\Framework\DataAbstractionLayer\FieldCollection;
use EKhadi\Core\Content\EKhadi\Area\EKhadiAreaDefinition;

class EKhadiCustomerProfileDefinition extends EntityDefinition
{
    public function getEntityName(): string
    {
        return 'ekhadi_customer_profile';
    }

    public function getEntityClass(): string
    {
        return EKhadiCustomerProfileEntity::class;
    }

    public function getCollectionClass(): string
    {
        return EKhadiCustomerProfileCollection::class;
    }

    protected function defineFields(): FieldCollection
    {
        return new FieldCollection([
            (new IdField('id', 'id'))->addFlags(new PrimaryKey(), new Required()),
            (new FkField('customer_id', 'customerId', CustomerDefinition::class, 'id'))->addFlags(new Required()),
            new FkField('area_id', 'areaId', EKhadiAreaDefinition::class, 'id'),
            (new BoolField('is_grant_recipient', 'isGrantRecipient'))->addFlags(new Required()),
            (new FloatField('grant_amount', 'grantAmount'))->addFlags(new Required()),
            (new IntField('grant_pay_day', 'grantPayDay'))->addFlags(new Required()),
            (new FloatField('credit_limit', 'creditLimit'))->addFlags(new Required()),
            (new DateTimeField('created_at', 'createdAt'))->addFlags(new Required()),
            new DateTimeField('updated_at', 'updatedAt'),

            new ManyToOneAssociationField('customer', 'customer_id', CustomerDefinition::class, 'id'),
            new ManyToOneAssociationField('area', 'area_id', EKhadiAreaDefinition::class, 'id'),
        ]);
    }
}
