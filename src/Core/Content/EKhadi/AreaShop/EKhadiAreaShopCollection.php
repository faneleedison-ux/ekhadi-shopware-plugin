<?php

namespace EKhadi\Core\Content\EKhadi\AreaShop;

use Shopware\Core\Framework\DataAbstractionLayer\EntityCollection;

/**
 * @method void                        add(EKhadiAreaShopEntity $entity)
 * @method EKhadiAreaShopEntity[]      getIterator()
 * @method EKhadiAreaShopEntity[]      getElements()
 * @method EKhadiAreaShopEntity|null   get(string $key)
 * @method EKhadiAreaShopEntity|null   last()
 */
class EKhadiAreaShopCollection extends EntityCollection
{
    protected function getExpectedClass(): string
    {
        return EKhadiAreaShopEntity::class;
    }
}
