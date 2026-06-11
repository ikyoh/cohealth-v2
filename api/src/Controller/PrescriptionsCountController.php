<?php

namespace App\Controller;

use App\Entity\User;
use App\Repository\PrescriptionRepository;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpKernel\Attribute\AsController;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Bundle\SecurityBundle\Security;

#[AsController]
class PrescriptionsCountController extends AbstractController
{

    public function __construct(
        private PrescriptionRepository $repository,
        private Security $security,
    )
    {
    }

    public function __invoke(): JsonResponse
    {
        /** @var User|null $user */
        $user = $this->security->getUser();

        if (!$user instanceof User || $user->getUuid() === null) {
            return new JsonResponse(['count' => 0]);
        }

        $count = $this->repository
            ->createQueryBuilder('prescription')
            ->select('COUNT(DISTINCT prescription.id)')
            ->leftJoin('prescription.owner', 'owner')
            ->leftJoin('prescription.mission', 'mission')
            ->leftJoin('mission.owner', 'missionOwner')
            ->leftJoin('mission.owners', 'sharedOwner', 'WITH', 'sharedOwner.uuid = :currentUserUuid')
            ->andWhere(
                'owner.uuid = :currentUserUuid'
                . ' OR missionOwner.uuid = :currentUserUuid'
                . ' OR sharedOwner.id IS NOT NULL'
            )
            ->setParameter('currentUserUuid', $user->getUuid()->toRfc4122())
            ->getQuery()
            ->getSingleScalarResult();

        return new JsonResponse(['count' => $count]);
    }
}
