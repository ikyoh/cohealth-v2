<?php

namespace App\State;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use App\Entity\Event;
use App\Repository\UserRepository;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Component\Uid\Uuid;

/**
 * @implements ProcessorInterface<Event, Event>
 */
final class EventProcessor implements ProcessorInterface
{
    public function __construct(
        private readonly UserRepository $userRepository,
        #[Autowire(service: 'api_platform.doctrine.orm.state.persist_processor')]
        private readonly ProcessorInterface $persistProcessor,
    ) {
    }

    public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = []): Event
    {
        if (!$data instanceof Event) {
            throw new \InvalidArgumentException('EventProcessor only supports Event resources.');
        }

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
}
