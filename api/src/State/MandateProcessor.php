<?php

namespace App\State;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use App\Entity\Mandate;
use App\Entity\User;
use App\Model\MandateGroupStatusEnum;
use App\Model\MandateStatusEnum;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;

/**
 * @implements ProcessorInterface<Mandate, Mandate>
 */
final class MandateProcessor implements ProcessorInterface
{
    public function __construct(
        #[Autowire(service: 'api_platform.doctrine.orm.state.persist_processor')]
        private readonly ProcessorInterface $persistProcessor,
        private readonly Security $security,
    ) {
    }

    public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = []): Mandate
    {
        if (!$data instanceof Mandate) {
            throw new \InvalidArgumentException('MandateProcessor only supports Mandate resources.');
        }

        $previous = $context['previous_data'] ?? null;
        $user = $this->security->getUser();

        if (!$previous instanceof Mandate || !$user instanceof User) {
            throw new AccessDeniedHttpException('Modification du mandat non autorisée.');
        }

        if (in_array('ROLE_COORDINATOR', $user->getRoles(), true)) {
            $this->processAssignment($data, $previous);
        } else {
            $this->processResponse($data, $previous, $user);
        }

        if ($data->getStatus() === MandateStatusEnum::ACCEPTED && $data->getAcceptedAt() === null) {
            $data->setAcceptedAt(new \DateTimeImmutable());
            $data->setRejectedAt(null);
        } elseif ($data->getStatus() === MandateStatusEnum::REJECTED && $data->getRejectedAt() === null) {
            $data->setRejectedAt(new \DateTimeImmutable());
            $data->setAcceptedAt(null);
        }

        $this->updateGroupStatus($data);

        return $this->persistProcessor->process($data, $operation, $uriVariables, $context);
    }

    private function processAssignment(Mandate $data, Mandate $previous): void
    {
        $assignedTo = $data->getAssignedTo();

        if (
            $assignedTo === null
            || $this->isSameUser($assignedTo, $previous->getAssignedTo())
            || !$assignedTo->isCooperator()
            || $assignedTo->getIsActive() !== true
            || $assignedTo->getIsApproved() !== true
            || !$this->hasSameContent($data, $previous)
        ) {
            throw new AccessDeniedHttpException('Le coordinateur peut uniquement attribuer le mandat à un professionnel actif.');
        }

        $data
            ->setStatus(MandateStatusEnum::ASSIGNED)
            ->setAcceptedAt(null)
            ->setRejectedAt(null);
    }

    private function processResponse(Mandate $data, Mandate $previous, User $user): void
    {
        if (
            !$this->isSameUser($previous->getAssignedTo(), $user)
            || $previous->getStatus() !== MandateStatusEnum::ASSIGNED
            || !in_array($data->getStatus(), [MandateStatusEnum::ACCEPTED, MandateStatusEnum::REJECTED], true)
            || !$this->isSameUser($data->getAssignedTo(), $previous->getAssignedTo())
            || !$this->hasSameContent($data, $previous)
        ) {
            throw new AccessDeniedHttpException('Le professionnel attribué peut uniquement accepter ou refuser le mandat.');
        }
    }

    private function hasSameContent(Mandate $left, Mandate $right): bool
    {
        return $left->getCategory() === $right->getCategory()
            && $left->getBeginDate()?->format('Y-m-d') === $right->getBeginDate()?->format('Y-m-d')
            && $left->getDescription() === $right->getDescription()
            && (
                ($left->getMission() === null && $right->getMission() === null)
                || (
                    $left->getMission() !== null
                    && $right->getMission() !== null
                    && $left->getMission()->getUuid()->equals($right->getMission()->getUuid())
                )
            )
            && (
                ($left->getMandateGroup() === null && $right->getMandateGroup() === null)
                || (
                    $left->getMandateGroup() !== null
                    && $right->getMandateGroup() !== null
                    && $left->getMandateGroup()->getUuid()->equals($right->getMandateGroup()->getUuid())
                )
            );
    }

    private function updateGroupStatus(Mandate $mandate): void
    {
        $group = $mandate->getMandateGroup();

        if ($group === null) {
            return;
        }

        $statuses = array_map(
            static fn (Mandate $item): MandateStatusEnum => $item->getStatus(),
            $group->getMandates()->toArray(),
        );

        if (
            $statuses !== []
            && count(array_filter(
                $statuses,
                static fn (MandateStatusEnum $status): bool => $status === MandateStatusEnum::ACCEPTED,
            )) === count($statuses)
        ) {
            $group->setStatus(MandateGroupStatusEnum::COMPLETED);
            return;
        }

        $hasStartedMandate = array_filter(
            $statuses,
            static fn (MandateStatusEnum $status): bool => $status !== MandateStatusEnum::EDITED,
        ) !== [];

        $group->setStatus(
            $hasStartedMandate
                ? MandateGroupStatusEnum::IN_PROGRESS
                : MandateGroupStatusEnum::EDITED,
        );
    }

    private function isSameUser(?User $left, ?User $right): bool
    {
        if ($left === null || $right === null) {
            return $left === $right;
        }

        if ($left->getId() !== null && $right->getId() !== null) {
            return $left->getId() === $right->getId();
        }

        return $left->getUuid()->equals($right->getUuid());
    }
}
