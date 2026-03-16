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
class Migration1741958460EKhadiArea extends MigrationStep
{
    public function getCreationTimestamp(): int
    {
        return 1741958460;
    }

    public function update(Connection $connection): void
    {
        $connection->executeStatement("
            CREATE TABLE IF NOT EXISTS `ekhadi_area` (
                `id`            BINARY(16) NOT NULL,
                `name`          VARCHAR(255) NOT NULL,
                `description`   TEXT NULL,
                `province`      VARCHAR(100) NULL,
                `created_at`    DATETIME(3) NOT NULL,
                `updated_at`    DATETIME(3) NULL,
                PRIMARY KEY (`id`),
                INDEX `idx_ekhadi_area_name` (`name`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        ");
    }
}
