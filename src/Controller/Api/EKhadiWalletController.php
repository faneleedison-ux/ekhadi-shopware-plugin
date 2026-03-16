<?php

namespace EKhadi\Controller\Api;

use Shopware\Core\Framework\Context;
use EKhadi\Service\GroupWalletManager;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

#[Route(defaults: ['_routeScope' => ['api'], '_loginRequired' => true])]
class EKhadiWalletController
{
    public function __construct(
        private readonly GroupWalletManager $walletManager,
    ) {}

    // GET /api/ekhadi/group/{groupId}/wallet
    #[Route(path: '/api/ekhadi/group/{groupId}/wallet', name: 'api.ekhadi.wallet.get', methods: ['GET'])]
    public function getWallet(string $groupId, Context $context): JsonResponse
    {
        try {
            $wallet = $this->walletManager->getWalletByGroup($groupId, $context);
            if (!$wallet) {
                return new JsonResponse(['success' => false, 'message' => 'Wallet not found.'], 404);
            }

            $buckets = [];
            foreach ($wallet->getBuckets() ?? [] as $bucket) {
                $buckets[] = [
                    'id'                 => $bucket->getId(),
                    'bucketType'         => $bucket->getBucketType(),
                    'balance'            => $bucket->getBalance(),
                    'allowedCategories'  => $bucket->getAllowedCategories(),
                ];
            }

            return new JsonResponse([
                'success'    => true,
                'walletId'   => $wallet->getId(),
                'balance'    => $wallet->getBalance(),
                'currencyId' => $wallet->getCurrencyId(),
                'buckets'    => $buckets,
            ]);
        } catch (\Exception $e) {
            return new JsonResponse(['success' => false, 'message' => $e->getMessage()], 400);
        }
    }

    // POST /api/ekhadi/group/{groupId}/contribute
    #[Route(path: '/api/ekhadi/group/{groupId}/contribute', name: 'api.ekhadi.wallet.contribute', methods: ['POST'])]
    public function contribute(string $groupId, Request $request, Context $context): JsonResponse
    {
        try {
            $amount     = (float) $request->get('amount', 0);
            $bucketType = $request->get('bucketType');

            if ($amount <= 0) {
                return new JsonResponse(['success' => false, 'message' => 'Amount must be greater than zero.'], 400);
            }

            if ($bucketType) {
                $this->walletManager->creditBucket($groupId, $bucketType, $amount, $context);
            }

            $this->walletManager->creditWallet($groupId, $amount, $context);

            return new JsonResponse(['success' => true, 'message' => 'Contribution recorded.']);
        } catch (\Exception $e) {
            return new JsonResponse(['success' => false, 'message' => $e->getMessage()], 400);
        }
    }

    // POST /api/ekhadi/group/{groupId}/bucket
    #[Route(path: '/api/ekhadi/group/{groupId}/bucket', name: 'api.ekhadi.bucket.create', methods: ['POST'])]
    public function createBucket(string $groupId, Request $request, Context $context): JsonResponse
    {
        try {
            $bucketId = $this->walletManager->ensureBucket(
                $groupId,
                $request->get('bucketType', ''),
                $request->get('allowedCategories'),
                $context
            );

            return new JsonResponse(['success' => true, 'bucketId' => $bucketId], 201);
        } catch (\Exception $e) {
            return new JsonResponse(['success' => false, 'message' => $e->getMessage()], 400);
        }
    }

    // PATCH /api/ekhadi/bucket/{bucketId}/categories
    #[Route(path: '/api/ekhadi/bucket/{bucketId}/categories', name: 'api.ekhadi.bucket.categories', methods: ['PATCH'])]
    public function updateBucketCategories(string $bucketId, Request $request, Context $context): JsonResponse
    {
        try {
            $this->walletManager->updateBucketCategories(
                $bucketId,
                $request->get('allowedCategories'),
                $context
            );

            return new JsonResponse(['success' => true]);
        } catch (\Exception $e) {
            return new JsonResponse(['success' => false, 'message' => $e->getMessage()], 400);
        }
    }
}
