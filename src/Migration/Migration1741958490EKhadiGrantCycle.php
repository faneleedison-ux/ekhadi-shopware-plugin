<?php

declare(strict_types=1);

namespace EKhadi\Migration;

use Doctrine\DBAL\Connection;
use Shopware\Core\Framework\Log\Package;
use Shopware\Core\Framework\Migration\MigrationStep;

/**
 * Tracks each monthly SRD grant cycle per customer.
 * Spending velocity and shortfall-risk are computed from this table.
 *
 * @internal
 */
#[Package('framework')]
class Migration1741958490EKhadiGrantCycle extends MigrationStep
{
    public function getCreationTimestamp(): int
    {
        return 1741958490;
    }

    public function update(Connection $connection): void
    {
        $connection->executeStatement("
            CREATE TABLE IF NOT EXISTS `ekhadi_grant_cycle` (
                `id`                    BINARY(16) NOT NULL,
                `customer_id`           BINARY(16) NOT NULL,
                `grant_amount`          DECIMAL(10,2) NOT NULL,
                `payment_date`          DATETIME(3) NOT NULL,
                `cycle_start`           DATETIME(3) NOT NULL,
                `cycle_end`             DATETIME(3) NOT NULL,
                `amount_spent`          DECIMAL(10,2) NOT NULL DEFAULT 0.00,
                `shortfall_risk_score`  TINYINT UNSIGNED NOT NULL DEFAULT 0,
                `status`                VARCHAR(16) NOT NULL DEFAULT 'active',
                `created_at`            DATETIME(3) NOT NULL,
                `updated_at`            DATETIME(3) NULL,
                PRIMARY KEY (`id`),
                INDEX `idx_grant_cycle_customer` (`customer_id`),
                INDEX `idx_grant_cycle_status` (`status`),
                CONSTRAINT `fk_grant_cycle_customer` FOREIGN KEY (`customer_id`)
                    REFERENCES `customer` (`id`) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        ");
    }
}
