<?php

declare(strict_types=1);

namespace EKhadi\Subscriber;

use Shopware\Core\Checkout\Cart\Event\CheckoutOrderPlacedEvent;
use EKhadi\Service\GrantCycleService;
use EKhadi\Service\GroupWalletManager;
use EKhadi\Service\StoreCreditManager;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;

class CartSubscriber implements EventSubscriberInterface
{
    private StoreCreditManager $storeCreditManager;
    private GroupWalletManager $groupWalletManager;
    private GrantCycleService $grantCycleService;

    public function __construct(
        StoreCreditManager $storeCreditManager,
        GroupWalletManager $groupWalletManager,
        GrantCycleService $grantCycleService
    ) {
        $this->storeCreditManager = $storeCreditManager;
        $this->groupWalletManager = $groupWalletManager;
        $this->grantCycleService  = $grantCycleService;
    }

    public static function getSubscribedEvents(): array
    {
        return [
            CheckoutOrderPlacedEvent::class => 'onOrderPlaced',

            ];
    }


    public function onOrderPlaced(CheckoutOrderPlacedEvent $event): void
    {
        $order      = $event->getOrder();
        $customerId = $order->getOrderCustomer()->getCustomerId();
        $orderId    = $order->getId();
        $currencyId = $order->getCurrencyId();

        $orderLineItems = $order->getLineItems();

        $storeCreditLineItem = $orderLineItems
            ->filterByType('credit')
            ->filter(function ($lineItem) {
                return $lineItem->getLabel() === 'Store credit discount';
            })
            ->first();

        if ($storeCreditLineItem) {
            $amountToDeduct = abs($storeCreditLineItem->getTotalPrice());
            $payload        = $storeCreditLineItem->getPayload() ?? [];
            $bucketType     = $payload['bucketType'] ?? null;

            if ($bucketType !== null) {
                // Deduct from the group bucket; the personal store credit was never touched.
                $groupId = $this->resolveGroupId($customerId, $bucketType, $event->getContext());

                if ($groupId) {
                    try {
                        $this->groupWalletManager->deductFromBucket(
                            $groupId,
                            $bucketType,
                            $amountToDeduct,
                            $event->getContext()
                        );

                        // Update spend velocity on the customer's active grant cycle
                        $this->grantCycleService->recordSpend($customerId, $amountToDeduct, $event->getContext());
                    } catch (\RuntimeException $e) {
                        // Log and fall through; do not block order placement.
                    }
                }
            } else {
                $this->storeCreditManager->deductCredit(
                    $customerId,
                    $amountToDeduct,
                    $event->getContext(),
                    $orderId,
                    $currencyId,
                    'Store credit used for order payment'
                );
            }
        }
    }

    private function resolveGroupId(string $customerId, string $bucketType, \Shopware\Core\Framework\Context $context): ?string
    {
        $bucket = $this->groupWalletManager->getMemberBucket($customerId, $bucketType, $context);
        if (!$bucket) {
            return null;
        }

        // The wallet entity holds groupId; fetch it via the wallet repository through the manager.
        $wallet = $this->groupWalletManager->getWalletById($bucket->getWalletId(), $context);

        return $wallet?->getGroupId();
    }
}
