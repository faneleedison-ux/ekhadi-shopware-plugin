<?php

declare(strict_types=1);

namespace EKhadi\Migration;

use Doctrine\DBAL\Connection;
use Shopware\Core\Framework\Log\Package;
use Shopware\Core\Framework\Migration\MigrationStep;

/**
 * Holds one pending repayment entry per customer.
 * When a grant payment arrives the outstanding amount + flat fee is auto-deducted.
 *
 * @internal
 */
#[Package('framework')]
class Migration1741958500EKhadiRepaymentSchedule extends MigrationStep
{
    public function getCreationTimestamp(): int
    {
        return 1741958500;
    }

    public function update(Connection $connection): void
    {
        $connection->executeStatement("
            CREATE TABLE IF NOT EXISTS `ekhadi_repayment_schedule` (
                `id`                    BINARY(16) NOT NULL,
                `customer_id`           BINARY(16) NOT NULL,
                `principal_owed`        DECIMAL(10,2) NOT NULL DEFAULT 0.00,
                `fee_amount`            DECIMAL(10,2) NOT NULL DEFAULT 0.00,
                `total_amount_owed`     DECIMAL(10,2) NOT NULL DEFAULT 0.00,
                `due_date`              DATETIME(3) NOT NULL,
                `status`                VARCHAR(16) NOT NULL DEFAULT 'pending',
                `credit_request_ids`    JSON NULL,
                `processed_at`          DATETIME(3) NULL,
                `created_at`            DATETIME(3) NOT NULL,
                `updated_at`            DATETIME(3) NULL,
                PRIMARY KEY (`id`),
                INDEX `idx_repayment_customer` (`customer_id`),
                INDEX `idx_repayment_status` (`status`),
                CONSTRAINT `fk_repayment_customer` FOREIGN KEY (`customer_id`)
                    REFERENCES `customer` (`id`) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        ");
    }
}
