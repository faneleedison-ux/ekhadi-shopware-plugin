<?php

declare(strict_types=1);

namespace EKhadi\Migration;

use Doctrine\DBAL\Connection;
use Shopware\Core\Framework\Log\Package;
use Shopware\Core\Framework\Migration\MigrationStep;

/**
 * Maps Shopware sales channels (spaza shops) to geographic areas.
 * A shop can serve multiple areas; an area can have multiple shops.
 *
 * @internal
 */
#[Package('framework')]
class Migration1741958480EKhadiAreaShop extends MigrationStep
{
    public function getCreationTimestamp(): int
    {
        return 1741958480;
    }

    public function update(Connection $connection): void
    {
        $connection->executeStatement("
            CREATE TABLE IF NOT EXISTS `ekhadi_area_shop` (
                `id`                BINARY(16) NOT NULL,
                `area_id`           BINARY(16) NOT NULL,
                `sales_channel_id`  BINARY(16) NOT NULL,
                `created_at`        DATETIME(3) NOT NULL,
                PRIMARY KEY (`id`),
                UNIQUE KEY `uq_area_shop` (`area_id`, `sales_channel_id`),
                INDEX `idx_area_shop_area` (`area_id`),
                INDEX `idx_area_shop_sc` (`sales_channel_id`),
                CONSTRAINT `fk_area_shop_area` FOREIGN KEY (`area_id`)
                    REFERENCES `ekhadi_area` (`id`) ON DELETE CASCADE,
                CONSTRAINT `fk_area_shop_sc` FOREIGN KEY (`sales_channel_id`)
                    REFERENCES `sales_channel` (`id`) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        ");
    }
}
