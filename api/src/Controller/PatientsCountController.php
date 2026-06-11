<?php

namespace App\Controller;

use App\Repository\PatientRepository;
use App\Entity\User;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpKernel\Attribute\AsController;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Bundle\SecurityBundle\Security;

#[AsController]
class PatientsCountController extends AbstractController
{

    public function __construct(
        private PatientRepository $repository,
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
            ->createQueryBuilder('patient')
            ->select('COUNT(DISTINCT patient.id)')
            ->leftJoin('patient.owner', 'owner')
            ->leftJoin('patient.missions', 'mission')
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
