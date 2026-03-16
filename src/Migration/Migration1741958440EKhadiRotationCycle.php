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
class Migration1741958440EKhadiRotationCycle extends MigrationStep
{
    public function getCreationTimestamp(): int
    {
        return 1741958440;
    }

    public function update(Connection $connection): void
    {
        $connection->executeStatement("
            CREATE TABLE IF NOT EXISTS `ekhadi_rotation_cycle` (
                `id`                        BINARY(16) NOT NULL,
                `group_id`                  BINARY(16) NOT NULL,
                `cycle_number`              INT NOT NULL,
                `beneficiary_customer_id`   BINARY(16) NOT NULL,
                `start_date`                DATE NOT NULL,
                `end_date`                  DATE NOT NULL,
                `status`                    VARCHAR(16) NOT NULL DEFAULT 'pending',
                `payout_amount`             DECIMAL(10,2) NOT NULL DEFAULT 0.00,
                `created_at`                DATETIME(3) NOT NULL,
                `updated_at`                DATETIME(3) NULL,
                PRIMARY KEY (`id`),
                UNIQUE KEY `uq_group_cycle` (`group_id`, `cycle_number`),
                INDEX `idx_ekhadi_cycle_group` (`group_id`),
                INDEX `idx_ekhadi_cycle_beneficiary` (`beneficiary_customer_id`),
                INDEX `idx_ekhadi_cycle_status` (`status`),
                CONSTRAINT `fk_ekhadi_cycle_group` FOREIGN KEY (`group_id`)
                    REFERENCES `ekhadi_group` (`id`) ON DELETE CASCADE,
                CONSTRAINT `fk_ekhadi_cycle_beneficiary` FOREIGN KEY (`beneficiary_customer_id`)
                    REFERENCES `customer` (`id`) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        ");
    }
}
