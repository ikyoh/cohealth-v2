<?php

namespace App\Controller;

use App\Entity\Event;
use App\Entity\EventException;
use App\Repository\EventExceptionRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bridge\Doctrine\Attribute\MapEntity;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;
use Symfony\Component\Routing\Attribute\Route;
use App\Entity\User;

final class EventOccurrenceController extends AbstractController
{
    #[Route('/events/{uuid}/occurrence', name: 'event_occurrence_update', methods: ['POST'])]
    public function __invoke(
        #[MapEntity(mapping: ['uuid' => 'uuid'])] Event $event,
        Request $request,
        EventExceptionRepository $repository,
        EntityManagerInterface $entityManager,
    ): JsonResponse {
        if ($event->getMission() !== null) {
            $this->denyAccessUnlessGranted('MISSION_EDIT', $event->getMission());
        } elseif (
            !$this->getUser() instanceof User
            || $event->getOwner()?->getId() !== $this->getUser()->getId()
        ) {
            throw $this->createAccessDeniedException();
        }

        if ($event->getRecurrenceRule() === null) {
            throw new BadRequestHttpException('Cet événement n’est pas récurrent.');
        }

        $payload = $request->toArray();
        $originalDate = $this->parseDate($payload['originalDate'] ?? null, 'originalDate');
        $action = $payload['action'] ?? 'update';
        $exception = $repository->findOneBy([
            'event' => $event,
            'originalDate' => $originalDate,
        ]) ?? (new EventException())
            ->setEvent($event)
            ->setOriginalDate($originalDate);

        if ($action === 'delete') {
            $exception->setIsCancelled(true);
        } elseif ($action === 'update') {
            $exception
                ->setIsCancelled(false)
                ->setRescheduledDate($this->parseDate($payload['beginDate'] ?? null, 'beginDate'))
                ->setRescheduledEnd($this->parseDate($payload['endDate'] ?? null, 'endDate'));

            if (array_key_exists('title', $payload)) {
                $exception->setTitle((string) $payload['title']);
            }

            if (array_key_exists('description', $payload)) {
                $exception->setDescription((string) $payload['description']);
            }

            if (array_key_exists('isAllday', $payload)) {
                $exception->setIsAllday((bool) $payload['isAllday']);
            }

            if (isset($payload['services']) && is_array($payload['services'])) {
                $exception->setServices($payload['services']);
            }
        } else {
            throw new BadRequestHttpException('Action inconnue.');
        }

        $entityManager->persist($exception);
        $entityManager->flush();

        return $this->json(['status' => 'ok']);
    }

    private function parseDate(mixed $value, string $field): \DateTimeImmutable
    {
        if (!is_string($value) || $value === '') {
            throw new BadRequestHttpException(sprintf('Le champ "%s" est obligatoire.', $field));
        }

        try {
            return new \DateTimeImmutable($value, new \DateTimeZone('Europe/Paris'));
        } catch (\Exception) {
            throw new BadRequestHttpException(sprintf('Le champ "%s" est invalide.', $field));
        }
    }
}
