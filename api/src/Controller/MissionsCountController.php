<?php

namespace App\Controller;

use App\Repository\MissionRepository;
use App\Entity\User;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpKernel\Attribute\AsController;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Bundle\SecurityBundle\Security;

#[AsController]
class MissionsCountController extends AbstractController
{

    public function __construct(
        private MissionRepository $repository,
        private Security $security,
    )
    {
    }

    public function __invoke(): JsonResponse
    {
        /** @var User|null $user */
        $user = $this->security->getUser();

        if (!$user instanceof User) {
            return new JsonResponse(['count' => 0]);
        }

        $count = $this->repository
            ->createQueryBuilder('mission')
            ->select('COUNT(mission.id)')
            ->andWhere('mission.owner = :currentUser')
            ->setParameter('currentUser', $user)
            ->getQuery()
            ->getSingleScalarResult();

        return new JsonResponse(['count' => $count]);
    }
}
