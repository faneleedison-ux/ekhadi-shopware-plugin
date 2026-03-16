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
class Migration1741958450EKhadiCreditRequest extends MigrationStep
{
    public function getCreationTimestamp(): int
    {
        return 1741958450;
    }

    public function update(Connection $connection): void
    {
        $connection->executeStatement("
            CREATE TABLE IF NOT EXISTS `ekhadi_credit_request` (
                `id`                        BINARY(16) NOT NULL,
                `group_id`                  BINARY(16) NOT NULL,
                `requester_customer_id`     BINARY(16) NOT NULL,
                `bucket_type`               VARCHAR(32) NOT NULL,
                `amount`                    DECIMAL(10,2) NOT NULL,
                `reason`                    TEXT NULL,
                `status`                    VARCHAR(16) NOT NULL DEFAULT 'pending',
                `approvals_count`           INT NOT NULL DEFAULT 0,
                `required_approvals`        INT NOT NULL DEFAULT 2,
                `approved_by`               JSON NULL,
                `repayment_date`            DATE NULL,
                `repaid_at`                 DATETIME(3) NULL,
                `created_at`               DATETIME(3) NOT NULL,
                `updated_at`                DATETIME(3) NULL,
                PRIMARY KEY (`id`),
                INDEX `idx_ekhadi_request_group` (`group_id`),
                INDEX `idx_ekhadi_request_requester` (`requester_customer_id`),
                INDEX `idx_ekhadi_request_status` (`status`),
                CONSTRAINT `fk_ekhadi_request_group` FOREIGN KEY (`group_id`)
                    REFERENCES `ekhadi_group` (`id`) ON DELETE CASCADE,
                CONSTRAINT `fk_ekhadi_request_requester` FOREIGN KEY (`requester_customer_id`)
                    REFERENCES `customer` (`id`) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        ");
    }
}
