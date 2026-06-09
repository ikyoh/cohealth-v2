<?php

namespace App\State;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use App\Entity\Principal;
use App\Entity\User;
use App\Repository\PrincipalRepository;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Component\HttpKernel\Exception\ConflictHttpException;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;

/**
 * @implements ProcessorInterface<User, User>
 */
final class UserProcessor implements ProcessorInterface
{
    public function __construct(
        private readonly PrincipalRepository $principalRepository,
        #[Autowire(service: 'api_platform.doctrine.orm.state.persist_processor')]
        private readonly ProcessorInterface $persistProcessor,
    ) {
    }

    public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = []): User
    {
        if (!$data instanceof User) {
            throw new \InvalidArgumentException('UserProcessor only supports User resources.');
        }

        if (
            $data->getIsApproved() === true
            && in_array('ROLE_PRINCIPAL', $data->getRoles(), true)
        ) {
            $this->attachPrincipal($data);
        }

        return $this->persistProcessor->process($data, $operation, $uriVariables, $context);
    }

    private function attachPrincipal(User $user): void
    {
        if ($user->getPrincipal() !== null) {
            return;
        }

        $principal = $this->findPrincipal($user);

        if ($principal?->getUser() !== null && $principal->getUser() !== $user) {
            throw new ConflictHttpException('Ce mandant est déjà lié à un autre utilisateur.');
        }

        if ($principal === null) {
            $principal = $this->createPrincipal($user);
        }

        $user->setPrincipal($principal);
    }

    private function findPrincipal(User $user): ?Principal
    {
        $gln = $this->normalize($user->getGln());
        $rcc = $this->normalize($user->getRcc());
        $principalByGln = $gln === null ? null : $this->principalRepository->findOneBy(['gln' => $gln]);
        $principalByRcc = $rcc === null ? null : $this->principalRepository->findOneBy(['rcc' => $rcc]);

        if ($principalByGln !== null && $principalByRcc !== null && $principalByGln !== $principalByRcc) {
            throw new ConflictHttpException('Le GLN et le RCC correspondent à deux mandants différents.');
        }

        $principal = $principalByGln ?? $principalByRcc;

        if ($principal === null) {
            return null;
        }

        if ($gln !== null && $principal->getGln() !== null && $principal->getGln() !== $gln) {
            throw new ConflictHttpException('Le RCC correspond à un mandant ayant un autre GLN.');
        }

        if ($rcc !== null && $principal->getRcc() !== null && $principal->getRcc() !== $rcc) {
            throw new ConflictHttpException('Le GLN correspond à un mandant ayant un autre RCC.');
        }

        return $principal;
    }

    private function createPrincipal(User $user): Principal
    {
        $missingFields = [];

        foreach ([
            'RCC' => $user->getRcc(),
            'GLN' => $user->getGln(),
            'adresse' => $user->getAddress(),
            'NPA' => $user->getPostCode(),
            'ville' => $user->getCity(),
            'catégorie' => $user->getPrincipalCategory(),
            'canton' => $user->getPrincipalCanton(),
        ] as $label => $value) {
            if ($value === null || $value === '') {
                $missingFields[] = $label;
            }
        }

        if ($missingFields !== []) {
            throw new UnprocessableEntityHttpException(sprintf(
                'Impossible de créer le mandant. Champs manquants : %s.',
                implode(', ', $missingFields),
            ));
        }

        $name = trim((string) $user->getOrganizationName());

        if ($name === '') {
            $name = trim(sprintf('%s %s', $user->getFirstname(), $user->getLastname()));
        }

        return (new Principal())
            ->setName($name)
            ->setCategory($user->getPrincipalCategory())
            ->setPhone($user->getPhone())
            ->setFax($user->getFax())
            ->setMobile($user->getMobile())
            ->setEmail($user->getEmail())
            ->setNpa($user->getPostCode())
            ->setCity($user->getCity())
            ->setCanton($user->getPrincipalCanton())
            ->setAddress($user->getAddress())
            ->setRcc($user->getRcc())
            ->setGln($user->getGln())
            ->setIsActive((bool) $user->getIsActive());
    }

    private function normalize(?string $value): ?string
    {
        $value = trim((string) $value);

        return $value === '' ? null : $value;
    }
}
