<?php

namespace EKhadi\Core\Content\EKhadi\Area;

use Shopware\Core\Framework\DataAbstractionLayer\EntityCollection;

/**
 * @method void                    add(EKhadiAreaEntity $entity)
 * @method EKhadiAreaEntity[]      getIterator()
 * @method EKhadiAreaEntity[]      getElements()
 * @method EKhadiAreaEntity|null   get(string $key)
 * @method EKhadiAreaEntity|null   first()
 * @method EKhadiAreaEntity|null   last()
 */
class EKhadiAreaCollection extends EntityCollection
{
    protected function getExpectedClass(): string
    {
        return EKhadiAreaEntity::class;
    }
}
