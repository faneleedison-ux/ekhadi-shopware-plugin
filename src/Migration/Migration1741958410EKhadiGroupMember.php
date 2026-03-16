<?php

declare(strict_types=1);

namespace EKhadi\Migration;

use Doctrine\DBAL\Connection;
use Shopware\Core\Framework\Log\Package;
use Shopware\Core\Framework\Migration\MigrationStep;

/**
 * @internal
 */
#[Package('framework')]
class Migration1741958410EKhadiGroupMember extends MigrationStep
{
    public function getCreationTimestamp(): int
    {
        return 1741958410;
    }

    public function update(Connection $connection): void
    {
        $connection->executeStatement("
            CREATE TABLE IF NOT EXISTS `ekhadi_group_member` (
                `id`                    BINARY(16) NOT NULL,
                `group_id`              BINARY(16) NOT NULL,
                `customer_id`           BINARY(16) NOT NULL,
                `role`                  VARCHAR(16) NOT NULL DEFAULT 'member',
                `status`                VARCHAR(16) NOT NULL DEFAULT 'active',
                `join_date`             DATE NOT NULL,
                `monthly_commitment`    DECIMAL(10,2) NOT NULL DEFAULT 0.00,
                `created_at`            DATETIME(3) NOT NULL,
                `updated_at`            DATETIME(3) NULL,
                PRIMARY KEY (`id`),
                UNIQUE KEY `uq_group_customer` (`group_id`, `customer_id`),
                INDEX `idx_ekhadi_member_group` (`group_id`),
                INDEX `idx_ekhadi_member_customer` (`customer_id`),
                CONSTRAINT `fk_ekhadi_member_group` FOREIGN KEY (`group_id`)
                    REFERENCES `ekhadi_group` (`id`) ON DELETE CASCADE,
                CONSTRAINT `fk_ekhadi_member_customer` FOREIGN KEY (`customer_id`)
                    REFERENCES `customer` (`id`) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        ");
    }
}
