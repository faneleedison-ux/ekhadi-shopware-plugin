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
class Migration1741958420EKhadiGroupWallet extends MigrationStep
{
    public function getCreationTimestamp(): int
    {
        return 1741958420;
    }

    public function update(Connection $connection): void
    {
        $connection->executeStatement("
            CREATE TABLE IF NOT EXISTS `ekhadi_group_wallet` (
                `id`            BINARY(16) NOT NULL,
                `group_id`      BINARY(16) NOT NULL,
                `balance`       DECIMAL(10,2) NOT NULL DEFAULT 0.00,
                `currency_id`   BINARY(16) NULL,
                `created_at`    DATETIME(3) NOT NULL,
                `updated_at`    DATETIME(3) NULL,
                PRIMARY KEY (`id`),
                UNIQUE KEY `uq_wallet_group` (`group_id`),
                INDEX `idx_ekhadi_wallet_group` (`group_id`),
                CONSTRAINT `fk_ekhadi_wallet_group` FOREIGN KEY (`group_id`)
                    REFERENCES `ekhadi_group` (`id`) ON DELETE CASCADE,
                CONSTRAINT `fk_ekhadi_wallet_currency` FOREIGN KEY (`currency_id`)
                    REFERENCES `currency` (`id`) ON DELETE SET NULL
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        ");
    }
}
