<?php

namespace EKhadi\Core\Content\EKhadi\Group;

use Shopware\Core\Framework\DataAbstractionLayer\EntityDefinition;
use Shopware\Core\Framework\DataAbstractionLayer\Field\DateTimeField;
use Shopware\Core\Framework\DataAbstractionLayer\Field\FkField;
use Shopware\Core\Framework\DataAbstractionLayer\Field\Flag\PrimaryKey;
use Shopware\Core\Framework\DataAbstractionLayer\Field\Flag\Required;
use Shopware\Core\Framework\DataAbstractionLayer\Field\IdField;
use Shopware\Core\Framework\DataAbstractionLayer\Field\IntField;
use Shopware\Core\Framework\DataAbstractionLayer\Field\LongTextField;
use Shopware\Core\Framework\DataAbstractionLayer\Field\OneToManyAssociationField;
use Shopware\Core\Framework\DataAbstractionLayer\Field\OneToOneAssociationField;
use Shopware\Core\Framework\DataAbstractionLayer\Field\StringField;
use Shopware\Core\Framework\DataAbstractionLayer\FieldCollection;
use Shopware\Core\System\Currency\CurrencyDefinition;
use EKhadi\Core\Content\EKhadi\Area\EKhadiAreaDefinition;
use EKhadi\Core\Content\EKhadi\CreditRequest\EKhadiCreditRequestDefinition;
use EKhadi\Core\Content\EKhadi\GroupMember\EKhadiGroupMemberDefinition;
use EKhadi\Core\Content\EKhadi\GroupWallet\EKhadiGroupWalletDefinition;
use EKhadi\Core\Content\EKhadi\RotationCycle\EKhadiRotationCycleDefinition;

class EKhadiGroupDefinition extends EntityDefinition
{
    public function getEntityName(): string
    {
        return 'ekhadi_group';
    }

    public function getEntityClass(): string
    {
        return EKhadiGroupEntity::class;
    }

    public function getCollectionClass(): string
    {
        return EKhadiGroupCollection::class;
    }

    protected function defineFields(): FieldCollection
    {
        return new FieldCollection([
            (new IdField('id', 'id'))->addFlags(new PrimaryKey(), new Required()),
            (new StringField('name', 'name'))->addFlags(new Required()),
            new LongTextField('description', 'description'),
            (new StringField('status', 'status'))->addFlags(new Required()),
            (new IntField('max_members', 'maxMembers'))->addFlags(new Required()),
            (new IntField('contribution_day', 'contributionDay'))->addFlags(new Required()),
            new FkField('currency_id', 'currencyId', CurrencyDefinition::class, 'id'),
            new FkField('area_id', 'areaId', EKhadiAreaDefinition::class, 'id'),
            (new DateTimeField('created_at', 'createdAt'))->addFlags(new Required()),
            new DateTimeField('updated_at', 'updatedAt'),

            new OneToManyAssociationField('members', EKhadiGroupMemberDefinition::class, 'group_id'),
            new OneToOneAssociationField('wallet', 'id', 'group_id', EKhadiGroupWalletDefinition::class),
            new OneToManyAssociationField('rotationCycles', EKhadiRotationCycleDefinition::class, 'group_id'),
            new OneToManyAssociationField('creditRequests', EKhadiCreditRequestDefinition::class, 'group_id'),
        ]);
    }
}
