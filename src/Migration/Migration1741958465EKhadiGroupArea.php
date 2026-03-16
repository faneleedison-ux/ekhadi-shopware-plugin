<?php

declare(strict_types=1);

namespace EKhadi\Migration;

use Doctrine\DBAL\Connection;
use Shopware\Core\Framework\Log\Package;
use Shopware\Core\Framework\Migration\MigrationStep;

/**
 * Adds area_id to ekhadi_group so each stokvel is rooted in a specific neighbourhood.
 *
 * @internal
 */
#[Package('framework')]
class Migration1741958465EKhadiGroupArea extends MigrationStep
{
    public function getCreationTimestamp(): int
    {
        return 1741958465;
    }

    public function update(Connection $connection): void
    {
        $connection->executeStatement("
            ALTER TABLE `ekhadi_group`
                ADD COLUMN `area_id` BINARY(16) NULL AFTER `currency_id`,
                ADD INDEX `idx_ekhadi_group_area` (`area_id`),
                ADD CONSTRAINT `fk_ekhadi_group_area`
                    FOREIGN KEY (`area_id`) REFERENCES `ekhadi_area` (`id`) ON DELETE SET NULL;
        ");
    }
}
