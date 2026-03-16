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
class Migration1741958430EKhadiGroupBucket extends MigrationStep
{
    public function getCreationTimestamp(): int
    {
        return 1741958430;
    }

    public function update(Connection $connection): void
    {
        $connection->executeStatement("
            CREATE TABLE IF NOT EXISTS `ekhadi_group_bucket` (
                `id`                    BINARY(16) NOT NULL,
                `wallet_id`             BINARY(16) NOT NULL,
                `bucket_type`           VARCHAR(32) NOT NULL,
                `balance`               DECIMAL(10,2) NOT NULL DEFAULT 0.00,
                `allowed_categories`    JSON NULL,
                `created_at`            DATETIME(3) NOT NULL,
                `updated_at`            DATETIME(3) NULL,
                PRIMARY KEY (`id`),
                UNIQUE KEY `uq_wallet_bucket_type` (`wallet_id`, `bucket_type`),
                INDEX `idx_ekhadi_bucket_wallet` (`wallet_id`),
                CONSTRAINT `fk_ekhadi_bucket_wallet` FOREIGN KEY (`wallet_id`)
                    REFERENCES `ekhadi_group_wallet` (`id`) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        ");
    }
}
