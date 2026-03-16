<?php

namespace EKhadi\Core\Content\EKhadi\GroupBucket;

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
use EKhadi\Core\Content\EKhadi\GroupWallet\EKhadiGroupWalletDefinition;

class EKhadiGroupBucketDefinition extends EntityDefinition
{
    public function getEntityName(): string
    {
        return 'ekhadi_group_bucket';
    }

    public function getEntityClass(): string
    {
        return EKhadiGroupBucketEntity::class;
    }

    public function getCollectionClass(): string
    {
        return EKhadiGroupBucketCollection::class;
    }

    protected function defineFields(): FieldCollection
    {
        return new FieldCollection([
            (new IdField('id', 'id'))->addFlags(new PrimaryKey(), new Required()),
            (new FkField('wallet_id', 'walletId', EKhadiGroupWalletDefinition::class, 'id'))->addFlags(new Required()),
            (new StringField('bucket_type', 'bucketType'))->addFlags(new Required()),
            (new FloatField('balance', 'balance'))->addFlags(new Required()),
            new JsonField('allowed_categories', 'allowedCategories'),
            (new DateTimeField('created_at', 'createdAt'))->addFlags(new Required()),
            new DateTimeField('updated_at', 'updatedAt'),

            new ManyToOneAssociationField('wallet', 'wallet_id', EKhadiGroupWalletDefinition::class, 'id'),
        ]);
    }
}
