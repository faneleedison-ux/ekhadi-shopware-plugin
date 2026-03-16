<?php

namespace EKhadi\Core\Content\EKhadi\GroupBucket;

use Shopware\Core\Framework\DataAbstractionLayer\EntityCollection;

/**
 * @method void                            add(EKhadiGroupBucketEntity $entity)
 * @method EKhadiGroupBucketEntity[]       getIterator()
 * @method EKhadiGroupBucketEntity[]       getElements()
 * @method EKhadiGroupBucketEntity|null    get(string $key)
 * @method EKhadiGroupBucketEntity|null    first()
 * @method EKhadiGroupBucketEntity|null    last()
 */
class EKhadiGroupBucketCollection extends EntityCollection
{
    protected function getExpectedClass(): string
    {
        return EKhadiGroupBucketEntity::class;
    }
}
