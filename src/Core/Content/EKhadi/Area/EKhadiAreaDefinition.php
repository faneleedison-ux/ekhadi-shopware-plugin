<?php

namespace EKhadi\Core\Content\EKhadi\Area;

use Shopware\Core\Framework\DataAbstractionLayer\EntityDefinition;
use Shopware\Core\Framework\DataAbstractionLayer\Field\DateTimeField;
use Shopware\Core\Framework\DataAbstractionLayer\Field\Flag\PrimaryKey;
use Shopware\Core\Framework\DataAbstractionLayer\Field\Flag\Required;
use Shopware\Core\Framework\DataAbstractionLayer\Field\IdField;
use Shopware\Core\Framework\DataAbstractionLayer\Field\LongTextField;
use Shopware\Core\Framework\DataAbstractionLayer\Field\OneToManyAssociationField;
use Shopware\Core\Framework\DataAbstractionLayer\Field\StringField;
use Shopware\Core\Framework\DataAbstractionLayer\FieldCollection;
use EKhadi\Core\Content\EKhadi\AreaShop\EKhadiAreaShopDefinition;

class EKhadiAreaDefinition extends EntityDefinition
{
    public function getEntityName(): string
    {
        return 'ekhadi_area';
    }

    public function getEntityClass(): string
    {
        return EKhadiAreaEntity::class;
    }

    public function getCollectionClass(): string
    {
        return EKhadiAreaCollection::class;
    }

    protected function defineFields(): FieldCollection
    {
        return new FieldCollection([
            (new IdField('id', 'id'))->addFlags(new PrimaryKey(), new Required()),
            (new StringField('name', 'name'))->addFlags(new Required()),
            new LongTextField('description', 'description'),
            new StringField('province', 'province'),
            (new DateTimeField('created_at', 'createdAt'))->addFlags(new Required()),
            new DateTimeField('updated_at', 'updatedAt'),

            new OneToManyAssociationField('shops', EKhadiAreaShopDefinition::class, 'area_id'),
        ]);
    }
}
