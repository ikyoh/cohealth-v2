<?php

namespace App\Controller;

use App\Entity\User;
use App\Repository\UserRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;
use Symfony\Component\Routing\Attribute\Route;

final class CooperatorsController extends AbstractController
{
    private const DEFAULT_ITEMS_PER_PAGE = 20;
    private const MAX_ITEMS_PER_PAGE = 100;
    private const ALLOWED_ROLES = [
        'ROLE_NURSE',
        'ROLE_PHYSIO',
    ];
    private const ALLOWED_SORTS = [
        'name',
        'profession',
        'organization',
        'city',
    ];

    public function __construct(
        private readonly UserRepository $repository,
    ) {
    }

    #[Route('/cooperators', name: 'cooperators_collection', methods: ['GET'])]
    public function __invoke(Request $request): JsonResponse
    {
        $this->denyAccessUnlessGranted('ROLE_USER');

        $search = mb_strtolower(trim($request->query->getString('search')));
        $role = $request->query->getString('role');
        $order = $request->query->all('order');

        if ($role !== '' && !in_array($role, self::ALLOWED_ROLES, true)) {
            throw new BadRequestHttpException('Le rôle demandé n’est pas autorisé.');
        }

        $sort = array_key_first($order) ?? 'name';
        $direction = strtoupper((string) ($order[$sort] ?? 'ASC'));

        if (!in_array($sort, self::ALLOWED_SORTS, true)) {
            throw new BadRequestHttpException('Le champ de tri demandé n’est pas autorisé.');
        }

        if (!in_array($direction, ['ASC', 'DESC'], true)) {
            throw new BadRequestHttpException('La direction du tri doit être ASC ou DESC.');
        }

        $page = max(1, $request->query->getInt('page', 1));
        $itemsPerPage = min(
            self::MAX_ITEMS_PER_PAGE,
            max(1, $request->query->getInt('itemsPerPage', self::DEFAULT_ITEMS_PER_PAGE)),
        );

        $cooperators = array_values(array_filter(
            $this->repository->findBy(
                ['isActive' => true, 'isApproved' => true],
                ['lastname' => 'ASC', 'firstname' => 'ASC'],
            ),
            static function (User $user) use ($role, $search): bool {
                if (!$user->isCooperator()) {
                    return false;
                }

                if ($role !== '' && !in_array($role, $user->getRoles(), true)) {
                    return false;
                }

                if ($search === '') {
                    return true;
                }

                $haystack = mb_strtolower(implode(' ', array_filter([
                    $user->getFirstname(),
                    $user->getLastname(),
                    $user->getOrganizationName(),
                    $user->getEmail(),
                ])));

                return str_contains($haystack, $search);
            },
        ));

        usort(
            $cooperators,
            fn (User $first, User $second): int => $this->compareCooperators(
                $first,
                $second,
                $sort,
                $direction,
            ),
        );

        $totalItems = count($cooperators);
        $offset = ($page - 1) * $itemsPerPage;
        $members = array_slice($cooperators, $offset, $itemsPerPage);
        $nextPage = $offset + $itemsPerPage < $totalItems
            ? $this->buildNextPageUrl($request, $page + 1)
            : null;

        return $this->json([
            'member' => array_map(
                static fn (User $user): array => [
                    '@id' => '/users/' . $user->getUuid(),
                    '@type' => 'User',
                    'uuid' => $user->getUuid()?->toRfc4122(),
                    'firstname' => $user->getFirstname(),
                    'lastname' => $user->getLastname(),
                    'organizationName' => $user->getOrganizationName(),
                    'email' => $user->getEmail(),
                    'mobile' => $user->getMobile(),
                    'phone' => $user->getPhone(),
                    'city' => $user->getCity(),
                    'roles' => array_values(array_intersect(
                        $user->getRoles(),
                        self::ALLOWED_ROLES,
                    )),
                ],
                $members,
            ),
            'totalItems' => $totalItems,
            'view' => $nextPage ? ['next' => $nextPage] : null,
        ]);
    }

    private function buildNextPageUrl(Request $request, int $page): string
    {
        $parameters = $request->query->all();
        $parameters['page'] = $page;

        return '/cooperators?' . http_build_query($parameters);
    }

    private function compareCooperators(
        User $first,
        User $second,
        string $sort,
        string $direction,
    ): int {
        $firstValue = $this->getSortValue($first, $sort);
        $secondValue = $this->getSortValue($second, $sort);
        $comparison = strnatcasecmp($firstValue, $secondValue);

        if ($comparison === 0) {
            $comparison = strnatcasecmp(
                $this->getSortValue($first, 'name'),
                $this->getSortValue($second, 'name'),
            );
        }

        return $direction === 'DESC' ? -$comparison : $comparison;
    }

    private function getSortValue(User $user, string $sort): string
    {
        return match ($sort) {
            'profession' => $this->getProfessionLabel($user),
            'organization' => $user->getOrganizationName() ?? '',
            'city' => $user->getCity() ?? '',
            default => trim(($user->getLastname() ?? '') . ' ' . ($user->getFirstname() ?? '')),
        };
    }

    private function getProfessionLabel(User $user): string
    {
        $labels = [];
        $roles = $user->getRoles();

        if (in_array('ROLE_NURSE', $roles, true)) {
            $labels[] = 'Infirmier';
        }

        if (in_array('ROLE_PHYSIO', $roles, true)) {
            $labels[] = 'Physiothérapeute';
        }

        return implode(' ', $labels);
    }
}
