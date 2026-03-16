<?php

declare(strict_types=1);

namespace EKhadi;

use Shopware\Core\Framework\Plugin;
use Shopware\Core\Framework\Plugin\Context\ActivateContext;
use Shopware\Core\Framework\Plugin\Context\DeactivateContext;
use Shopware\Core\Framework\Plugin\Context\InstallContext;
use Shopware\Core\Framework\Plugin\Context\UninstallContext;
use Shopware\Core\Framework\Plugin\Context\UpdateContext;
use Doctrine\DBAL\Connection;
use EKhadi\Service\OrderStateInstaller;

class EKhadi extends Plugin
{
    public function install(InstallContext $installContext): void
    {
    }

    public function uninstall(UninstallContext $uninstallContext): void
    {
        parent::uninstall($uninstallContext);

        if ($uninstallContext->keepUserData()) {
            return;
        }

        $connection = $this->container->get(Connection::class);
        $connection->executeStatement('DROP TABLE IF EXISTS `ekhadi_repayment_schedule`');
        $connection->executeStatement('DROP TABLE IF EXISTS `ekhadi_grant_cycle`');
        $connection->executeStatement('DROP TABLE IF EXISTS `ekhadi_credit_request`');
        $connection->executeStatement('DROP TABLE IF EXISTS `ekhadi_rotation_cycle`');
        $connection->executeStatement('DROP TABLE IF EXISTS `ekhadi_group_bucket`');
        $connection->executeStatement('DROP TABLE IF EXISTS `ekhadi_group_wallet`');
        $connection->executeStatement('DROP TABLE IF EXISTS `ekhadi_group_member`');
        $connection->executeStatement('DROP TABLE IF EXISTS `ekhadi_group`');
        $connection->executeStatement('DROP TABLE IF EXISTS `ekhadi_area_shop`');
        $connection->executeStatement('DROP TABLE IF EXISTS `ekhadi_customer_profile`');
        $connection->executeStatement('DROP TABLE IF EXISTS `ekhadi_area`');
        $connection->executeStatement('DROP TABLE IF EXISTS `store_credit_history`');
        $connection->executeStatement('DROP TABLE IF EXISTS `store_credit`');
    }


    public function activate(ActivateContext $activateContext): void
    {
    }

    public function deactivate(DeactivateContext $deactivateContext): void
    {
    }

    public function update(UpdateContext $updateContext): void
    {
    }

    public function postInstall(InstallContext $installContext): void
    {
    }

    public function postUpdate(UpdateContext $updateContext): void
    {
    }
}
