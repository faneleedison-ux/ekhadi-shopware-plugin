<?php

namespace EKhadi\Core\Content\EKhadi\AreaShop;

use Shopware\Core\Framework\DataAbstractionLayer\EntityDefinition;
use Shopware\Core\Framework\DataAbstractionLayer\Field\DateTimeField;
use Shopware\Core\Framework\DataAbstractionLayer\Field\FkField;
use Shopware\Core\Framework\DataAbstractionLayer\Field\Flag\PrimaryKey;
use Shopware\Core\Framework\DataAbstractionLayer\Field\Flag\Required;
use Shopware\Core\Framework\DataAbstractionLayer\Field\IdField;
use Shopware\Core\Framework\DataAbstractionLayer\Field\ManyToOneAssociationField;
use Shopware\Core\Framework\DataAbstractionLayer\FieldCollection;
use Shopware\Core\System\SalesChannel\SalesChannelDefinition;
use EKhadi\Core\Content\EKhadi\Area\EKhadiAreaDefinition;

class EKhadiAreaShopDefinition extends EntityDefinition
{
    public function getEntityName(): string
    {
        return 'ekhadi_area_shop';
    }

    public function getEntityClass(): string
    {
        return EKhadiAreaShopEntity::class;
    }

    public function getCollectionClass(): string
    {
        return EKhadiAreaShopCollection::class;
    }

    protected function defineFields(): FieldCollection
    {
        return new FieldCollection([
            (new IdField('id', 'id'))->addFlags(new PrimaryKey(), new Required()),
            (new FkField('area_id', 'areaId', EKhadiAreaDefinition::class, 'id'))->addFlags(new Required()),
            (new FkField('sales_channel_id', 'salesChannelId', SalesChannelDefinition::class, 'id'))->addFlags(new Required()),
            (new DateTimeField('created_at', 'createdAt'))->addFlags(new Required()),

            new ManyToOneAssociationField('area', 'area_id', EKhadiAreaDefinition::class, 'id'),
            new ManyToOneAssociationField('salesChannel', 'sales_channel_id', SalesChannelDefinition::class, 'id'),
        ]);
    }
}
