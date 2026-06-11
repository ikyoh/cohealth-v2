<?php

namespace App\Controller;

use ApiPlatform\Metadata\IriConverterInterface;
use ApiPlatform\Metadata\Exception\InvalidArgumentException;
use ApiPlatform\Metadata\Exception\ItemNotFoundException;
use App\Entity\Mission;
use App\Entity\User;
use App\Security\Voter\MissionVoter;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bridge\Doctrine\Attribute\MapEntity;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;
use Symfony\Component\Routing\Attribute\Route;

final class MissionSharingController extends AbstractController
{
    public function __construct(
        private readonly IriConverterInterface $iriConverter,
        private readonly EntityManagerInterface $entityManager,
    ) {
    }

    #[Route('/missions/{uuid}/sharing', name: 'mission_sharing', methods: ['PATCH'])]
    public function __invoke(
        #[MapEntity(mapping: ['uuid' => 'uuid'])] Mission $mission,
        Request $request,
    ): JsonResponse
    {
        $this->denyAccessUnlessGranted(MissionVoter::MANAGE_SHARING, $mission);

        $payload = $request->toArray();
        $ownerIris = $payload['owners'] ?? null;

        if (!is_array($ownerIris)) {
            throw new BadRequestHttpException('Le champ "owners" doit être un tableau d’IRI utilisateurs.');
        }

        $users = [];

        foreach (array_unique($ownerIris) as $ownerIri) {
            if (!is_string($ownerIri) || $ownerIri === '') {
                throw new BadRequestHttpException('Chaque owner doit être un IRI utilisateur valide.');
            }

            try {
                $user = $this->iriConverter->getResourceFromIri($ownerIri);
            } catch (InvalidArgumentException|ItemNotFoundException $exception) {
                throw new BadRequestHttpException(
                    sprintf('L’IRI utilisateur "%s" est invalide.', $ownerIri),
                    $exception
                );
            }

            if (!$user instanceof User) {
                throw new BadRequestHttpException(sprintf('La ressource "%s" n’est pas un utilisateur.', $ownerIri));
            }

            if (
                !$user->isCooperator()
                || $user->getIsActive() !== true
                || $user->getIsApproved() !== true
            ) {
                throw new BadRequestHttpException(sprintf('L’utilisateur "%s" ne peut pas recevoir de mission.', $ownerIri));
            }

            if ($mission->getOwner()?->getId() !== $user->getId()) {
                $users[] = $user;
            }
        }

        $mission->setOwners($users);
        $this->entityManager->flush();

        return $this->json([
            'owners' => array_map(
                fn (User $user): ?string => $this->iriConverter->getIriFromResource($user),
                $users
            ),
        ]);
    }
}
