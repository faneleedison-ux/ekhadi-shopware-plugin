<?php

declare(strict_types=1);

namespace EKhadi\Migration;

use Doctrine\DBAL\Connection;
use Shopware\Core\Framework\Log\Package;
use Shopware\Core\Framework\Migration\MigrationStep;

/**
 * Stores area assignment and grant details for each e-Khadi customer.
 *
 * @internal
 */
#[Package('framework')]
class Migration1741958470EKhadiCustomerProfile extends MigrationStep
{
    public function getCreationTimestamp(): int
    {
        return 1741958470;
    }

    public function update(Connection $connection): void
    {
        $connection->executeStatement("
            CREATE TABLE IF NOT EXISTS `ekhadi_customer_profile` (
                `id`                BINARY(16) NOT NULL,
                `customer_id`       BINARY(16) NOT NULL,
                `area_id`           BINARY(16) NULL,
                `is_grant_recipient` TINYINT(1) NOT NULL DEFAULT 1,
                `grant_amount`      DECIMAL(10,2) NOT NULL DEFAULT 0.00,
                `grant_pay_day`     TINYINT NOT NULL DEFAULT 1,
                `credit_limit`      DECIMAL(10,2) NOT NULL DEFAULT 0.00,
                `created_at`        DATETIME(3) NOT NULL,
                `updated_at`        DATETIME(3) NULL,
                PRIMARY KEY (`id`),
                UNIQUE KEY `uq_profile_customer` (`customer_id`),
                INDEX `idx_profile_area` (`area_id`),
                CONSTRAINT `fk_profile_customer` FOREIGN KEY (`customer_id`)
                    REFERENCES `customer` (`id`) ON DELETE CASCADE,
                CONSTRAINT `fk_profile_area` FOREIGN KEY (`area_id`)
                    REFERENCES `ekhadi_area` (`id`) ON DELETE SET NULL
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        ");
    }
}
