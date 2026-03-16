<?php

namespace EKhadi\Core\Content\EKhadi\RepaymentSchedule;

use Shopware\Core\Framework\DataAbstractionLayer\EntityCollection;

/**
 * @method void                                  add(EKhadiRepaymentScheduleEntity $entity)
 * @method EKhadiRepaymentScheduleEntity[]       getIterator()
 * @method EKhadiRepaymentScheduleEntity[]       getElements()
 * @method EKhadiRepaymentScheduleEntity|null    get(string $key)
 * @method EKhadiRepaymentScheduleEntity|null    first()
 * @method EKhadiRepaymentScheduleEntity|null    last()
 */
class EKhadiRepaymentScheduleCollection extends EntityCollection
{
    protected function getExpectedClass(): string { return EKhadiRepaymentScheduleEntity::class; }
}
