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
class Migration1741958400EKhadiGroup extends MigrationStep
{
    public function getCreationTimestamp(): int
    {
        return 1741958400;
    }

    public function update(Connection $connection): void
    {
        $connection->executeStatement("
            CREATE TABLE IF NOT EXISTS `ekhadi_group` (
                `id`                BINARY(16) NOT NULL,
                `name`              VARCHAR(255) NOT NULL,
                `description`       TEXT NULL,
                `status`            VARCHAR(16) NOT NULL DEFAULT 'active',
                `max_members`       INT NOT NULL DEFAULT 20,
                `contribution_day`  TINYINT NOT NULL DEFAULT 1,
                `currency_id`       BINARY(16) NULL,
                `created_at`        DATETIME(3) NOT NULL,
                `updated_at`        DATETIME(3) NULL,
                PRIMARY KEY (`id`),
                INDEX `idx_ekhadi_group_status` (`status`),
                CONSTRAINT `fk_ekhadi_group_currency` FOREIGN KEY (`currency_id`)
                    REFERENCES `currency` (`id`) ON DELETE SET NULL
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        ");
    }
}
