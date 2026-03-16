<?php

namespace EKhadi\Controller\Api;

use Shopware\Core\Framework\Context;
use EKhadi\Service\AreaManager;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

#[Route(defaults: ['_routeScope' => ['api'], '_loginRequired' => true])]
class EKhadiAreaController
{
    public function __construct(
        private readonly AreaManager $areaManager,
    ) {}

    // POST /api/ekhadi/area
    #[Route(path: '/api/ekhadi/area', name: 'api.ekhadi.area.create', methods: ['POST'])]
    public function createArea(Request $request, Context $context): JsonResponse
    {
        try {
            $areaId = $this->areaManager->createArea(
                $request->get('name', ''),
                $request->get('description'),
                $request->get('province'),
                $context
            );

            return new JsonResponse(['success' => true, 'areaId' => $areaId], 201);
        } catch (\Exception $e) {
            return new JsonResponse(['success' => false, 'message' => $e->getMessage()], 400);
        }
    }

    // GET /api/ekhadi/areas
    #[Route(path: '/api/ekhadi/areas', name: 'api.ekhadi.area.list', methods: ['GET'])]
    public function listAreas(Context $context): JsonResponse
    {
        try {
            $areas = $this->areaManager->listAreas($context);

            return new JsonResponse([
                'success' => true,
                'areas'   => array_values(array_map(fn ($a) => [
                    'id'       => $a->getId(),
                    'name'     => $a->getName(),
                    'province' => $a->getProvince(),
                ], $areas)),
            ]);
        } catch (\Exception $e) {
            return new JsonResponse(['success' => false, 'message' => $e->getMessage()], 400);
        }
    }

    // GET /api/ekhadi/area/{areaId}
    #[Route(path: '/api/ekhadi/area/{areaId}', name: 'api.ekhadi.area.get', methods: ['GET'])]
    public function getArea(string $areaId, Context $context): JsonResponse
    {
        try {
            $area = $this->areaManager->getArea($areaId, $context);
            if (!$area) {
                return new JsonResponse(['success' => false, 'message' => 'Area not found.'], 404);
            }

            $shops = [];
            foreach ($area->getShops() ?? [] as $shop) {
                $shops[] = ['salesChannelId' => $shop->getSalesChannelId()];
            }

            return new JsonResponse([
                'success' => true,
                'area'    => [
                    'id'          => $area->getId(),
                    'name'        => $area->getName(),
                    'description' => $area->getDescription(),
                    'province'    => $area->getProvince(),
                    'shops'       => $shops,
                ],
            ]);
        } catch (\Exception $e) {
            return new JsonResponse(['success' => false, 'message' => $e->getMessage()], 400);
        }
    }

    // POST /api/ekhadi/area/{areaId}/shop
    #[Route(path: '/api/ekhadi/area/{areaId}/shop', name: 'api.ekhadi.area.shop.assign', methods: ['POST'])]
    public function assignShop(string $areaId, Request $request, Context $context): JsonResponse
    {
        try {
            $this->areaManager->assignShopToArea(
                $request->get('salesChannelId', ''),
                $areaId,
                $context
            );

            return new JsonResponse(['success' => true]);
        } catch (\Exception $e) {
            return new JsonResponse(['success' => false, 'message' => $e->getMessage()], 400);
        }
    }

    // DELETE /api/ekhadi/area/{areaId}/shop/{salesChannelId}
    #[Route(path: '/api/ekhadi/area/{areaId}/shop/{salesChannelId}', name: 'api.ekhadi.area.shop.remove', methods: ['DELETE'])]
    public function removeShop(string $areaId, string $salesChannelId, Context $context): JsonResponse
    {
        try {
            $this->areaManager->removeShopFromArea($salesChannelId, $areaId, $context);

            return new JsonResponse(['success' => true]);
        } catch (\Exception $e) {
            return new JsonResponse(['success' => false, 'message' => $e->getMessage()], 400);
        }
    }

    // PUT /api/ekhadi/customer/{customerId}/profile
    #[Route(path: '/api/ekhadi/customer/{customerId}/profile', name: 'api.ekhadi.customer.profile.upsert', methods: ['PUT'])]
    public function upsertCustomerProfile(string $customerId, Request $request, Context $context): JsonResponse
    {
        try {
            $allowed = ['areaId', 'isGrantRecipient', 'grantAmount', 'grantPayDay', 'creditLimit'];
            $data    = array_intersect_key($request->request->all(), array_flip($allowed));

            $this->areaManager->upsertCustomerProfile($customerId, $data, $context);

            return new JsonResponse(['success' => true]);
        } catch (\Exception $e) {
            return new JsonResponse(['success' => false, 'message' => $e->getMessage()], 400);
        }
    }

    // GET /api/ekhadi/customer/{customerId}/profile
    #[Route(path: '/api/ekhadi/customer/{customerId}/profile', name: 'api.ekhadi.customer.profile.get', methods: ['GET'])]
    public function getCustomerProfile(string $customerId, Context $context): JsonResponse
    {
        try {
            $profile = $this->areaManager->getCustomerProfile($customerId, $context);
            if (!$profile) {
                return new JsonResponse(['success' => true, 'profile' => null]);
            }

            return new JsonResponse([
                'success' => true,
                'profile' => [
                    'customerId'       => $profile->getCustomerId(),
                    'areaId'           => $profile->getAreaId(),
                    'isGrantRecipient' => $profile->isGrantRecipient(),
                    'grantAmount'      => $profile->getGrantAmount(),
                    'grantPayDay'      => $profile->getGrantPayDay(),
                    'creditLimit'      => $profile->getCreditLimit(),
                ],
            ]);
        } catch (\Exception $e) {
            return new JsonResponse(['success' => false, 'message' => $e->getMessage()], 400);
        }
    }

    // POST /api/ekhadi/customer/{customerId}/credit-limit/recompute
    #[Route(path: '/api/ekhadi/customer/{customerId}/credit-limit/recompute', name: 'api.ekhadi.customer.credit_limit.recompute', methods: ['POST'])]
    public function recomputeCreditLimit(string $customerId, Request $request, Context $context): JsonResponse
    {
        try {
            $percentage = (float) $request->get('percentage', 50);
            $newLimit   = $this->areaManager->recomputeCreditLimit($customerId, $percentage, $context);

            return new JsonResponse(['success' => true, 'creditLimit' => $newLimit]);
        } catch (\Exception $e) {
            return new JsonResponse(['success' => false, 'message' => $e->getMessage()], 400);
        }
    }
}
