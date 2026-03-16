<?php

namespace EKhadi\Core\Content\EKhadi\GroupWallet;

use Shopware\Core\Framework\DataAbstractionLayer\EntityCollection;

/**
 * @method void                           add(EKhadiGroupWalletEntity $entity)
 * @method EKhadiGroupWalletEntity[]      getIterator()
 * @method EKhadiGroupWalletEntity[]      getElements()
 * @method EKhadiGroupWalletEntity|null   get(string $key)
 * @method EKhadiGroupWalletEntity|null   first()
 * @method EKhadiGroupWalletEntity|null   last()
 */
class EKhadiGroupWalletCollection extends EntityCollection
{
    protected function getExpectedClass(): string
    {
        return EKhadiGroupWalletEntity::class;
    }
}
