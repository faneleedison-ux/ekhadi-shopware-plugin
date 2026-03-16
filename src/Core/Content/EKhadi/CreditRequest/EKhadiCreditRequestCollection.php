<?php

namespace EKhadi\Core\Content\EKhadi\CreditRequest;

use Shopware\Core\Framework\DataAbstractionLayer\EntityCollection;

/**
 * @method void                               add(EKhadiCreditRequestEntity $entity)
 * @method EKhadiCreditRequestEntity[]        getIterator()
 * @method EKhadiCreditRequestEntity[]        getElements()
 * @method EKhadiCreditRequestEntity|null     get(string $key)
 * @method EKhadiCreditRequestEntity|null     first()
 * @method EKhadiCreditRequestEntity|null     last()
 */
class EKhadiCreditRequestCollection extends EntityCollection
{
    protected function getExpectedClass(): string
    {
        return EKhadiCreditRequestEntity::class;
    }
}
