<?php

namespace EKhadi\Core\Content\EKhadi\GrantCycle;

use Shopware\Core\Framework\DataAbstractionLayer\EntityCollection;

/**
 * @method void                          add(EKhadiGrantCycleEntity $entity)
 * @method EKhadiGrantCycleEntity[]      getIterator()
 * @method EKhadiGrantCycleEntity[]      getElements()
 * @method EKhadiGrantCycleEntity|null   get(string $key)
 * @method EKhadiGrantCycleEntity|null   first()
 * @method EKhadiGrantCycleEntity|null   last()
 */
class EKhadiGrantCycleCollection extends EntityCollection
{
    protected function getExpectedClass(): string { return EKhadiGrantCycleEntity::class; }
}
