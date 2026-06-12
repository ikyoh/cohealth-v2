<?php

namespace App\State;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\Metadata\Post;
use ApiPlatform\State\ProcessorInterface;
use App\Entity\Event;
use App\Entity\User;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\Uid\Uuid;

/**
 * @implements ProcessorInterface<Event, Event>
 */
final class EventProcessor implements ProcessorInterface
{
    public function __construct(
        private readonly UserRepository $userRepository,
        private readonly EntityManagerInterface $entityManager,
        private readonly Security $security,
        #[Autowire(service: 'api_platform.doctrine.orm.state.persist_processor')]
        private readonly ProcessorInterface $persistProcessor,
    ) {
    }

    public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = []): Event
    {
        if (!$data instanceof Event) {
            throw new \InvalidArgumentException('EventProcessor only supports Event resources.');
        }

        $this->realignExceptionAnchors($data);
        $this->applyMissionOwnership($data, $operation);

        $cooperators = [];

        foreach ($data->getServices() ?? [] as $service) {
            $iri = is_array($service) ? ($service['cooperator']['@id'] ?? null) : null;

            if (!is_string($iri) || !preg_match('#^/users/([^/]+)$#', $iri, $matches)) {
                continue;
            }

            $uuid = Uuid::fromString($matches[1]);
            $cooperator = $this->userRepository->findOneBy(['uuid' => $uuid]);

            if ($cooperator !== null) {
                $cooperators[(string) $cooperator->getUuid()] = $cooperator;
            }
        }

        $data->setCooperators($cooperators);

        return $this->persistProcessor->process($data, $operation, $uriVariables, $context);
    }

    private function applyMissionOwnership(Event $event, Operation $operation): void
    {
        if (!$operation instanceof Post || $event->getMission() === null) {
            return;
        }

        $missionOwner = $event->getMission()->getOwner();
        $currentUser = $this->security->getUser();

        if ($missionOwner === null || !$currentUser instanceof User) {
            return;
        }

        $event->setOwner($missionOwner);

        if (
            ($missionOwner->getId() !== null && $missionOwner->getId() === $currentUser->getId())
            || $missionOwner->getUuid()->equals($currentUser->getUuid())
        ) {
            return;
        }

        $currentUserIri = '/users/' . $currentUser->getUuid();
        $services = array_map(
            static function (mixed $service) use ($currentUser, $currentUserIri): mixed {
                if (!is_array($service)) {
                    return $service;
                }

                $service['cooperator'] = [
                    '@id' => $currentUserIri,
                    'uuid' => $currentUser->getUuid()?->toRfc4122(),
                    'firstname' => $currentUser->getFirstname(),
                    'lastname' => $currentUser->getLastname(),
                ];

                return $service;
            },
            $event->getServices() ?? [],
        );

        $event->setServices($services);
    }

    private function realignExceptionAnchors(Event $event): void
    {
        if ($event->getId() === null || $event->getExceptions()->isEmpty()) {
            return;
        }

        $originalData = $this->entityManager
            ->getUnitOfWork()
            ->getOriginalEntityData($event);
        $previousRule = $originalData['recurrenceRule'] ?? null;
        $currentRule = $event->getRecurrenceRule();

        if (!is_string($previousRule) || !is_string($currentRule) || $previousRule === $currentRule) {
            return;
        }

        $event->realignExceptionAnchors($previousRule);
    }
}
