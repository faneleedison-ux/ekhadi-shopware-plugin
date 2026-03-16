<?php

namespace EKhadi\Controller\Api;

use Shopware\Core\Framework\Context;
use EKhadi\Service\GroupManager;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

#[Route(defaults: ['_routeScope' => ['api'], '_loginRequired' => true])]
class EKhadiGroupController
{
    public function __construct(
        private readonly GroupManager $groupManager,
    ) {}

    // POST /api/ekhadi/group
    #[Route(path: '/api/ekhadi/group', name: 'api.ekhadi.group.create', methods: ['POST'])]
    public function createGroup(Request $request, Context $context): JsonResponse
    {
        try {
            $groupId = $this->groupManager->createGroup(
                $request->get('name', ''),
                $request->get('description'),
                $request->get('currencyId'),
                (int) $request->get('maxMembers', 20),
                (int) $request->get('contributionDay', 1),
                $context
            );

            return new JsonResponse(['success' => true, 'groupId' => $groupId], 201);
        } catch (\Exception $e) {
            return new JsonResponse(['success' => false, 'message' => $e->getMessage()], 400);
        }
    }

    // GET /api/ekhadi/group/{groupId}
    #[Route(path: '/api/ekhadi/group/{groupId}', name: 'api.ekhadi.group.get', methods: ['GET'])]
    public function getGroup(string $groupId, Context $context): JsonResponse
    {
        try {
            $group = $this->groupManager->getGroup($groupId, $context);
            if (!$group) {
                return new JsonResponse(['success' => false, 'message' => 'Group not found.'], 404);
            }

            return new JsonResponse([
                'success' => true,
                'group'   => [
                    'id'              => $group->getId(),
                    'name'            => $group->getName(),
                    'description'     => $group->getDescription(),
                    'status'          => $group->getStatus(),
                    'maxMembers'      => $group->getMaxMembers(),
                    'contributionDay' => $group->getContributionDay(),
                    'currencyId'      => $group->getCurrencyId(),
                    'memberCount'     => count($group->getMembers() ?? []),
                ],
            ]);
        } catch (\Exception $e) {
            return new JsonResponse(['success' => false, 'message' => $e->getMessage()], 400);
        }
    }

    // GET /api/ekhadi/groups
    #[Route(path: '/api/ekhadi/groups', name: 'api.ekhadi.group.list', methods: ['GET'])]
    public function listGroups(Context $context): JsonResponse
    {
        try {
            $groups = $this->groupManager->listGroups($context);

            return new JsonResponse([
                'success' => true,
                'groups'  => array_values(array_map(fn ($g) => [
                    'id'          => $g->getId(),
                    'name'        => $g->getName(),
                    'status'      => $g->getStatus(),
                    'memberCount' => count($g->getMembers() ?? []),
                ], $groups)),
            ]);
        } catch (\Exception $e) {
            return new JsonResponse(['success' => false, 'message' => $e->getMessage()], 400);
        }
    }

    // PATCH /api/ekhadi/group/{groupId}
    #[Route(path: '/api/ekhadi/group/{groupId}', name: 'api.ekhadi.group.update', methods: ['PATCH'])]
    public function updateGroup(string $groupId, Request $request, Context $context): JsonResponse
    {
        try {
            $allowed = ['name', 'description', 'status', 'maxMembers', 'contributionDay', 'currencyId'];
            $data    = array_intersect_key($request->request->all(), array_flip($allowed));

            $this->groupManager->updateGroup($groupId, $data, $context);

            return new JsonResponse(['success' => true]);
        } catch (\Exception $e) {
            return new JsonResponse(['success' => false, 'message' => $e->getMessage()], 400);
        }
    }

    // POST /api/ekhadi/group/{groupId}/member
    #[Route(path: '/api/ekhadi/group/{groupId}/member', name: 'api.ekhadi.group.member.add', methods: ['POST'])]
    public function addMember(string $groupId, Request $request, Context $context): JsonResponse
    {
        try {
            $memberId = $this->groupManager->addMember(
                $groupId,
                $request->get('customerId', ''),
                $request->get('role', 'member'),
                (float) $request->get('monthlyCommitment', 0),
                $context
            );

            return new JsonResponse(['success' => true, 'memberId' => $memberId], 201);
        } catch (\Exception $e) {
            return new JsonResponse(['success' => false, 'message' => $e->getMessage()], 400);
        }
    }

    // DELETE /api/ekhadi/member/{memberId}
    #[Route(path: '/api/ekhadi/member/{memberId}', name: 'api.ekhadi.group.member.remove', methods: ['DELETE'])]
    public function removeMember(string $memberId, Context $context): JsonResponse
    {
        try {
            $this->groupManager->removeMember($memberId, $context);

            return new JsonResponse(['success' => true]);
        } catch (\Exception $e) {
            return new JsonResponse(['success' => false, 'message' => $e->getMessage()], 400);
        }
    }

    // GET /api/ekhadi/group/{groupId}/members
    #[Route(path: '/api/ekhadi/group/{groupId}/members', name: 'api.ekhadi.group.members.list', methods: ['GET'])]
    public function listMembers(string $groupId, Context $context): JsonResponse
    {
        try {
            $members = $this->groupManager->getGroupMembers($groupId, $context);

            return new JsonResponse([
                'success' => true,
                'members' => array_values(array_map(fn ($m) => [
                    'id'                => $m->getId(),
                    'customerId'        => $m->getCustomerId(),
                    'role'              => $m->getRole(),
                    'status'            => $m->getStatus(),
                    'monthlyCommitment' => $m->getMonthlyCommitment(),
                ], $members)),
            ]);
        } catch (\Exception $e) {
            return new JsonResponse(['success' => false, 'message' => $e->getMessage()], 400);
        }
    }
}
