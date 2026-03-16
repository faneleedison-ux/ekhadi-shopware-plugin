<?php

namespace EKhadi\Core\Content\EKhadi\Group;

use Shopware\Core\Framework\DataAbstractionLayer\EntityCollection;

/**
 * @method void                add(EKhadiGroupEntity $entity)
 * @method EKhadiGroupEntity[]    getIterator()
 * @method EKhadiGroupEntity[]    getElements()
 * @method EKhadiGroupEntity|null get(string $key)
 * @method EKhadiGroupEntity|null first()
 * @method EKhadiGroupEntity|null last()
 */
class EKhadiGroupCollection extends EntityCollection
{
    protected function getExpectedClass(): string
    {
        return EKhadiGroupEntity::class;
    }
}
