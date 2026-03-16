<?php

namespace EKhadi\Core\Content\EKhadi\RotationCycle;

use Shopware\Core\Framework\DataAbstractionLayer\EntityCollection;

/**
 * @method void                               add(EKhadiRotationCycleEntity $entity)
 * @method EKhadiRotationCycleEntity[]        getIterator()
 * @method EKhadiRotationCycleEntity[]        getElements()
 * @method EKhadiRotationCycleEntity|null     get(string $key)
 * @method EKhadiRotationCycleEntity|null     first()
 * @method EKhadiRotationCycleEntity|null     last()
 */
class EKhadiRotationCycleCollection extends EntityCollection
{
    protected function getExpectedClass(): string
    {
        return EKhadiRotationCycleEntity::class;
    }
}
