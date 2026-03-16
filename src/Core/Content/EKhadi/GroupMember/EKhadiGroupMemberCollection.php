<?php

namespace EKhadi\Core\Content\EKhadi\GroupMember;

use Shopware\Core\Framework\DataAbstractionLayer\EntityCollection;

/**
 * @method void                          add(EKhadiGroupMemberEntity $entity)
 * @method EKhadiGroupMemberEntity[]     getIterator()
 * @method EKhadiGroupMemberEntity[]     getElements()
 * @method EKhadiGroupMemberEntity|null  get(string $key)
 * @method EKhadiGroupMemberEntity|null  first()
 * @method EKhadiGroupMemberEntity|null  last()
 */
class EKhadiGroupMemberCollection extends EntityCollection
{
    protected function getExpectedClass(): string
    {
        return EKhadiGroupMemberEntity::class;
    }
}
