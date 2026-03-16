<?php

namespace EKhadi\Core\Content\EKhadi\RepaymentSchedule;

use Shopware\Core\Checkout\Customer\CustomerDefinition;
use Shopware\Core\Framework\DataAbstractionLayer\EntityDefinition;
use Shopware\Core\Framework\DataAbstractionLayer\Field\DateTimeField;
use Shopware\Core\Framework\DataAbstractionLayer\Field\FkField;
use Shopware\Core\Framework\DataAbstractionLayer\Field\Flag\PrimaryKey;
use Shopware\Core\Framework\DataAbstractionLayer\Field\Flag\Required;
use Shopware\Core\Framework\DataAbstractionLayer\Field\FloatField;
use Shopware\Core\Framework\DataAbstractionLayer\Field\IdField;
use Shopware\Core\Framework\DataAbstractionLayer\Field\JsonField;
use Shopware\Core\Framework\DataAbstractionLayer\Field\ManyToOneAssociationField;
use Shopware\Core\Framework\DataAbstractionLayer\Field\StringField;
use Shopware\Core\Framework\DataAbstractionLayer\FieldCollection;

class EKhadiRepaymentScheduleDefinition extends EntityDefinition
{
    public function getEntityName(): string { return 'ekhadi_repayment_schedule'; }
    public function getEntityClass(): string { return EKhadiRepaymentScheduleEntity::class; }
    public function getCollectionClass(): string { return EKhadiRepaymentScheduleCollection::class; }

    protected function defineFields(): FieldCollection
    {
        return new FieldCollection([
            (new IdField('id', 'id'))->addFlags(new PrimaryKey(), new Required()),
            (new FkField('customer_id', 'customerId', CustomerDefinition::class, 'id'))->addFlags(new Required()),
            (new FloatField('principal_owed', 'principalOwed'))->addFlags(new Required()),
            (new FloatField('fee_amount', 'feeAmount'))->addFlags(new Required()),
            (new FloatField('total_amount_owed', 'totalAmountOwed'))->addFlags(new Required()),
            (new DateTimeField('due_date', 'dueDate'))->addFlags(new Required()),
            (new StringField('status', 'status'))->addFlags(new Required()),
            new JsonField('credit_request_ids', 'creditRequestIds'),
            new DateTimeField('processed_at', 'processedAt'),
            (new DateTimeField('created_at', 'createdAt'))->addFlags(new Required()),
            new DateTimeField('updated_at', 'updatedAt'),

            new ManyToOneAssociationField('customer', 'customer_id', CustomerDefinition::class, 'id'),
        ]);
    }
}
