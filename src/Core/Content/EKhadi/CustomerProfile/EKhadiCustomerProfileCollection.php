<?php

namespace EKhadi\Core\Content\EKhadi\CustomerProfile;

use Shopware\Core\Framework\DataAbstractionLayer\EntityCollection;

/**
 * @method void                                add(EKhadiCustomerProfileEntity $entity)
 * @method EKhadiCustomerProfileEntity[]       getIterator()
 * @method EKhadiCustomerProfileEntity[]       getElements()
 * @method EKhadiCustomerProfileEntity|null    get(string $key)
 * @method EKhadiCustomerProfileEntity|null    first()
 * @method EKhadiCustomerProfileEntity|null    last()
 */
class EKhadiCustomerProfileCollection extends EntityCollection
{
    protected function getExpectedClass(): string
    {
        return EKhadiCustomerProfileEntity::class;
    }
}
