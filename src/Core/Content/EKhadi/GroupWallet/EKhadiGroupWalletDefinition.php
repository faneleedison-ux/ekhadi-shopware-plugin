<?php

namespace EKhadi\Core\Content\EKhadi\GroupWallet;

use Shopware\Core\Framework\DataAbstractionLayer\EntityDefinition;
use Shopware\Core\Framework\DataAbstractionLayer\Field\DateTimeField;
use Shopware\Core\Framework\DataAbstractionLayer\Field\FkField;
use Shopware\Core\Framework\DataAbstractionLayer\Field\Flag\PrimaryKey;
use Shopware\Core\Framework\DataAbstractionLayer\Field\Flag\Required;
use Shopware\Core\Framework\DataAbstractionLayer\Field\FloatField;
use Shopware\Core\Framework\DataAbstractionLayer\Field\IdField;
use Shopware\Core\Framework\DataAbstractionLayer\Field\ManyToOneAssociationField;
use Shopware\Core\Framework\DataAbstractionLayer\Field\OneToManyAssociationField;
use Shopware\Core\Framework\DataAbstractionLayer\FieldCollection;
use Shopware\Core\System\Currency\CurrencyDefinition;
use EKhadi\Core\Content\EKhadi\Group\EKhadiGroupDefinition;
use EKhadi\Core\Content\EKhadi\GroupBucket\EKhadiGroupBucketDefinition;

class EKhadiGroupWalletDefinition extends EntityDefinition
{
    public function getEntityName(): string
    {
        return 'ekhadi_group_wallet';
    }

    public function getEntityClass(): string
    {
        return EKhadiGroupWalletEntity::class;
    }

    public function getCollectionClass(): string
    {
        return EKhadiGroupWalletCollection::class;
    }

    protected function defineFields(): FieldCollection
    {
        return new FieldCollection([
            (new IdField('id', 'id'))->addFlags(new PrimaryKey(), new Required()),
            (new FkField('group_id', 'groupId', EKhadiGroupDefinition::class, 'id'))->addFlags(new Required()),
            (new FloatField('balance', 'balance'))->addFlags(new Required()),
            new FkField('currency_id', 'currencyId', CurrencyDefinition::class, 'id'),
            (new DateTimeField('created_at', 'createdAt'))->addFlags(new Required()),
            new DateTimeField('updated_at', 'updatedAt'),

            new ManyToOneAssociationField('group', 'group_id', EKhadiGroupDefinition::class, 'id'),
            new OneToManyAssociationField('buckets', EKhadiGroupBucketDefinition::class, 'wallet_id'),
        ]);
    }
}
