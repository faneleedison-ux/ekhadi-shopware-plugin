<?php

namespace EKhadi\Storefront\Controller;

use Shopware\Core\Checkout\Cart\LineItem\LineItem;
use Shopware\Core\Checkout\Cart\Price\Struct\AbsolutePriceDefinition;
use Shopware\Core\Checkout\Cart\SalesChannel\CartService;
use Shopware\Core\Framework\Context;
use Shopware\Core\Framework\DataAbstractionLayer\EntityRepository;
use Shopware\Core\Framework\DataAbstractionLayer\Search\Criteria;
use Shopware\Core\Framework\DataAbstractionLayer\Search\Filter\EqualsFilter;
use Shopware\Core\Framework\Log\Package;
use Shopware\Core\System\SalesChannel\SalesChannelContext;
use Shopware\Core\System\SystemConfig\SystemConfigService;
use Shopware\Storefront\Controller\StorefrontController;
use EKhadi\Service\AreaManager;
use EKhadi\Service\GroupWalletManager;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\Routing\Attribute\Route;

#[Package('checkout')]
#[Route(defaults: ['_routeScope' => ['storefront']])]
class StoreCreditApplyController extends StorefrontController
{
    private CartService $cartService;
    private EntityRepository $storeCreditRepository;
    private SystemConfigService $systemConfigurationService;
    private GroupWalletManager $groupWalletManager;
    private AreaManager $areaManager;
    private string $storeCreditLineItemId = 'store-credit-discount';

    public function __construct(
        CartService $cartService,
        EntityRepository $storeCreditRepository,
        SystemConfigService $systemConfigurationService,
        GroupWalletManager $groupWalletManager,
        AreaManager $areaManager
    ) {
        $this->cartService = $cartService;
        $this->storeCreditRepository = $storeCreditRepository;
        $this->systemConfigurationService = $systemConfigurationService;
        $this->groupWalletManager = $groupWalletManager;
        $this->areaManager = $areaManager;
    }

    #[Route(path: '/store-credit-apply', name: 'frontend.store.credit.apply', defaults: ['_routeScope' => ['storefront']], methods: ['POST'])]
    public function applyStoreCredit(Request $request, SalesChannelContext $context): Response
    {
        $amount     = (float) $request->get('amount');
        $bucketType = $request->get('bucketType'); // optional: 'food', 'medicine', 'toiletries', 'general'
        $customer   = $context->getCustomer();

        if (!$customer || $amount <= 0) {
            $this->addFlash('danger', 'Invalid amount or customer not logged in.');
            return new RedirectResponse($this->generateUrl('frontend.checkout.confirm.page'));
        }

        // --- Bucket-based spending path ---
        if ($bucketType !== null) {
            // 1. Essential-goods restriction — only food, medicine, toiletries are credit-eligible.
            if (!$this->areaManager->isEssentialBucketType($bucketType)) {
                $this->addFlash('danger', 'Credit can only be used for essential goods: food, medicine, and toiletries.');
                return new RedirectResponse($this->generateUrl('frontend.checkout.confirm.page'));
            }

            // 2. Area restriction — customer must be assigned to the same area as this shop.
            if (!$this->areaManager->customerCanShopHere($customer->getId(), $context->getSalesChannelId(), $context->getContext())) {
                $this->addFlash('danger', 'Your e-Khadi credit can only be used at shops in your registered area.');
                return new RedirectResponse($this->generateUrl('frontend.checkout.confirm.page'));
            }

            // 3. Credit-limit check from the customer profile.
            $profile     = $this->areaManager->getCustomerProfile($customer->getId(), $context->getContext());
            $creditLimit = $profile?->getCreditLimit() ?? 0.00;
            if ($creditLimit > 0 && $amount > $creditLimit) {
                $this->addFlash('warning', 'Requested amount exceeds your e-Khadi credit limit of R' . number_format($creditLimit, 2) . '.');
                return new RedirectResponse($this->generateUrl('frontend.checkout.confirm.page'));
            }

            $bucket = $this->groupWalletManager->getMemberBucket($customer->getId(), $bucketType, $context->getContext());

            if (!$bucket) {
                $this->addFlash('warning', "No active '$bucketType' bucket found for your group.");
                return new RedirectResponse($this->generateUrl('frontend.checkout.confirm.page'));
            }

            // Enforce category restrictions when the bucket has a whitelist
            $allowedCategories = $bucket->getAllowedCategories() ?? [];
            if (!empty($allowedCategories)) {
                $cart = $this->cartService->getCart($context->getToken(), $context);
                foreach ($cart->getLineItems() as $lineItem) {
                    if ($lineItem->getType() !== LineItem::PRODUCT_LINE_ITEM_TYPE) {
                        continue;
                    }
                    $itemCategories = $lineItem->getPayloadValue('categoryIds') ?? [];
                    if (empty(array_intersect($itemCategories, $allowedCategories))) {
                        $this->addFlash(
                            'warning',
                            "\"" . htmlspecialchars($lineItem->getLabel() ?? '', ENT_QUOTES) . "\" is not allowed in the '$bucketType' bucket."
                        );
                        return new RedirectResponse($this->generateUrl('frontend.checkout.confirm.page'));
                    }
                }
            }

            $creditBalance = $bucket->getBalance();
            $amountToApply = min($creditBalance, $amount);

            if ($amountToApply <= 0) {
                $this->addFlash('warning', "The '$bucketType' bucket has no available balance.");
                return new RedirectResponse($this->generateUrl('frontend.checkout.confirm.page'));
            }

            // Build the line item with bucket metadata in the payload
            $cart            = $this->cartService->getCart($context->getToken(), $context);
            $lineItems       = $cart->getLineItems()->filterType(LineItem::CREDIT_LINE_ITEM_TYPE);
            $existingDiscount = $lineItems->get($this->storeCreditLineItemId);

            if ($existingDiscount) {
                $currentPrice = $existingDiscount->getPrice()->getTotalPrice();
                $newPrice     = max(-$creditBalance, $currentPrice - $amountToApply);
                $existingDiscount->setPriceDefinition(new AbsolutePriceDefinition($newPrice));
            } else {
                $discount = new LineItem($this->storeCreditLineItemId, LineItem::CREDIT_LINE_ITEM_TYPE, null, 1);
                $discount->setLabel('Store credit discount');
                $discount->setRemovable(true);
                $discount->setStackable(true);
                $discount->setPriceDefinition(new AbsolutePriceDefinition(-$amountToApply));
                $discount->setGood(false);
                $discount->setPayload(['bucketType' => $bucketType]);
                $this->cartService->add($cart, $discount, $context);
            }

            $this->cartService->recalculate($cart, $context);
            $this->addFlash('success', 'Bucket credit applied successfully.');
            return new RedirectResponse($this->generateUrl('frontend.checkout.confirm.page'));
        }
        // --- End bucket path ---

        if ($restrictedProducts = $this->hasRestrictedProductsInCart($context)) {
            $productNames = array_map(
                static fn ($product) => '<strong>' . htmlspecialchars($product['name'], ENT_QUOTES) . '</strong>',
                $restrictedProducts
            );
            $this->addFlash(
                'warning',
                'Store credit cannot be applied due to restricted products in the cart: ' . implode(', ', $productNames)
            );
            return new RedirectResponse($this->generateUrl('frontend.checkout.confirm.page'));
        }

        $creditBalance = $this->getCreditBalance($customer->getId(), $context->getContext());
        $amountToApply = min($creditBalance, $amount);

        $cart = $this->cartService->getCart($context->getToken(), $context);
        $lineItems = $cart->getLineItems()->filterType(LineItem::CREDIT_LINE_ITEM_TYPE);
        $storeCreditDiscount = $lineItems->get($this->storeCreditLineItemId);
        $totalAppliedCredit = 0;

        foreach ($lineItems as $lineItem) {
            $totalAppliedCredit += abs($lineItem->getPrice()->getTotalPrice());
        }

        $maxCreditPerOrder = $this->systemConfigurationService->get('StoreCredit.config.maxCreditPerOrder', $context->getSalesChannelId());
        if ($maxCreditPerOrder > 0) {
            $totalAfterApply = $totalAppliedCredit + $amountToApply;
            if ($totalAfterApply > $maxCreditPerOrder) {
                $this->addFlash('warning', "Maximum store credit per order is $" . number_format($maxCreditPerOrder, 2) . ". You can only apply $" . number_format($maxCreditPerOrder - $totalAppliedCredit, 2) . " more.");
                return new RedirectResponse($this->generateUrl('frontend.checkout.confirm.page'));
            }
        }

        if ($totalAppliedCredit + $amountToApply > $creditBalance) {
            $this->addFlash('warning', 'Requested amount exceeds available store credit.');
            return new RedirectResponse($this->generateUrl('frontend.checkout.confirm.page'));
        }

        if ($this->hasPremiumProtectionFee($context)) {
            $this->addFlash('warning', 'Store credit cannot be applied when premium protection is active.');
            return new RedirectResponse($this->generateUrl('frontend.checkout.confirm.page'));
        }

        if ($storeCreditDiscount) {
            $currentPrice = $storeCreditDiscount->getPrice()->getTotalPrice();
            $newPrice = max(-$creditBalance, $currentPrice - $amountToApply);
            $storeCreditDiscount->setPriceDefinition(new AbsolutePriceDefinition($newPrice));
        } else {
            $discount = new LineItem($this->storeCreditLineItemId, LineItem::CREDIT_LINE_ITEM_TYPE, null, 1);
            $discount->setLabel('Store credit discount');
            $discount->setRemovable(true);
            $discount->setStackable(true);
            $discount->setPriceDefinition(new AbsolutePriceDefinition(-$amountToApply));
            $discount->setGood(false);
            $this->cartService->add($cart, $discount, $context);
        }

        $this->cartService->recalculate($cart, $context);

        $this->addFlash('success', 'Store credit applied successfully.');
        return new RedirectResponse($this->generateUrl('frontend.checkout.confirm.page'));
    }

    private function getCreditBalance(?string $customerId, Context $context): float
    {
        if (!$customerId) {
            return 0.0;
        }

        $criteria = new Criteria();
        $criteria->addFilter(new EqualsFilter('customerId', $customerId));
        $result = $this->storeCreditRepository->search($criteria, $context);
        $storeCreditEntity = $result->first();

        return $storeCreditEntity ? (float)$storeCreditEntity->get('balance') : 0.0;
    }

    private function hasPremiumProtectionFee(SalesChannelContext $context): bool
    {
        $cart = $this->cartService->getCart($context->getToken(), $context);
        foreach ($cart->getLineItems() as $lineItem) {
            if ($lineItem->getReferencedId() === 'premium-protection-fee') {
                return true;
            }
        }
        return false;
    }

    private function hasRestrictedProductsInCart(SalesChannelContext $context): array|bool
    {
        $restrictedProductIds = $this->systemConfigurationService->get('StoreCredit.config.restrictedProducts', $context->getSalesChannelId());
        if (empty($restrictedProductIds)) {
            return false;
        }

        $cart = $this->cartService->getCart($context->getToken(), $context);
        $restrictedProducts = [];

        foreach ($cart->getLineItems() as $lineItem) {
            if (in_array($lineItem->getReferencedId(), $restrictedProductIds)) {
                $restrictedProducts[] = [
                    'id' => $lineItem->getReferencedId(),
                    'name' => $lineItem->getLabel(),
                ];
            }
        }
        return !empty($restrictedProducts) ? $restrictedProducts : false;
    }
}
