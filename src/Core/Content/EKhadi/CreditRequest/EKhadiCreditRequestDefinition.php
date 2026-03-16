<?php

namespace EKhadi\Core\Content\EKhadi\CreditRequest;

use Shopware\Core\Checkout\Customer\CustomerDefinition;
use Shopware\Core\Framework\DataAbstractionLayer\EntityDefinition;
use Shopware\Core\Framework\DataAbstractionLayer\Field\DateTimeField;
use Shopware\Core\Framework\DataAbstractionLayer\Field\FkField;
use Shopware\Core\Framework\DataAbstractionLayer\Field\Flag\PrimaryKey;
use Shopware\Core\Framework\DataAbstractionLayer\Field\Flag\Required;
use Shopware\Core\Framework\DataAbstractionLayer\Field\FloatField;
use Shopware\Core\Framework\DataAbstractionLayer\Field\IdField;
use Shopware\Core\Framework\DataAbstractionLayer\Field\IntField;
use Shopware\Core\Framework\DataAbstractionLayer\Field\JsonField;
use Shopware\Core\Framework\DataAbstractionLayer\Field\LongTextField;
use Shopware\Core\Framework\DataAbstractionLayer\Field\ManyToOneAssociationField;
use Shopware\Core\Framework\DataAbstractionLayer\Field\StringField;
use Shopware\Core\Framework\DataAbstractionLayer\FieldCollection;
use EKhadi\Core\Content\EKhadi\Group\EKhadiGroupDefinition;

class EKhadiCreditRequestDefinition extends EntityDefinition
{
    public function getEntityName(): string
    {
        return 'ekhadi_credit_request';
    }

    public function getEntityClass(): string
    {
        return EKhadiCreditRequestEntity::class;
    }

    public function getCollectionClass(): string
    {
        return EKhadiCreditRequestCollection::class;
    }

    protected function defineFields(): FieldCollection
    {
        return new FieldCollection([
            (new IdField('id', 'id'))->addFlags(new PrimaryKey(), new Required()),
            (new FkField('group_id', 'groupId', EKhadiGroupDefinition::class, 'id'))->addFlags(new Required()),
            (new FkField('requester_customer_id', 'requesterCustomerId', CustomerDefinition::class, 'id'))->addFlags(new Required()),
            (new StringField('bucket_type', 'bucketType'))->addFlags(new Required()),
            (new FloatField('amount', 'amount'))->addFlags(new Required()),
            new LongTextField('reason', 'reason'),
            (new StringField('status', 'status'))->addFlags(new Required()),
            (new IntField('approvals_count', 'approvalsCount'))->addFlags(new Required()),
            (new IntField('required_approvals', 'requiredApprovals'))->addFlags(new Required()),
            new JsonField('approved_by', 'approvedBy'),
            new DateTimeField('repayment_date', 'repaymentDate'),
            new DateTimeField('repaid_at', 'repaidAt'),
            (new DateTimeField('created_at', 'createdAt'))->addFlags(new Required()),
            new DateTimeField('updated_at', 'updatedAt'),

            new ManyToOneAssociationField('group', 'group_id', EKhadiGroupDefinition::class, 'id'),
            new ManyToOneAssociationField('requesterCustomer', 'requester_customer_id', CustomerDefinition::class, 'id'),
        ]);
    }
}
