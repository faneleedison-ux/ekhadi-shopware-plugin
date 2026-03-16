<?php

namespace EKhadi\Core\Content\EKhadi\GrantCycle;

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

class EKhadiGrantCycleDefinition extends EntityDefinition
{
    public function getEntityName(): string { return 'ekhadi_grant_cycle'; }
    public function getEntityClass(): string { return EKhadiGrantCycleEntity::class; }
    public function getCollectionClass(): string { return EKhadiGrantCycleCollection::class; }

    protected function defineFields(): FieldCollection
    {
        return new FieldCollection([
            (new IdField('id', 'id'))->addFlags(new PrimaryKey(), new Required()),
            (new FkField('customer_id', 'customerId', CustomerDefinition::class, 'id'))->addFlags(new Required()),
            (new FloatField('grant_amount', 'grantAmount'))->addFlags(new Required()),
            (new DateTimeField('payment_date', 'paymentDate'))->addFlags(new Required()),
            (new DateTimeField('cycle_start', 'cycleStart'))->addFlags(new Required()),
            (new DateTimeField('cycle_end', 'cycleEnd'))->addFlags(new Required()),
            (new FloatField('amount_spent', 'amountSpent'))->addFlags(new Required()),
            (new IntField('shortfall_risk_score', 'shortfallRiskScore'))->addFlags(new Required()),
            (new StringField('status', 'status'))->addFlags(new Required()),
            (new DateTimeField('created_at', 'createdAt'))->addFlags(new Required()),
            new DateTimeField('updated_at', 'updatedAt'),

            new ManyToOneAssociationField('customer', 'customer_id', CustomerDefinition::class, 'id'),
        ]);
    }
}
