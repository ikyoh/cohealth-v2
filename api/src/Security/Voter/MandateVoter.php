<?php

namespace App\Security\Voter;

use App\Entity\Mandate;
use App\Entity\User;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Authorization\Voter\Vote;
use Symfony\Component\Security\Core\Authorization\Voter\Voter;

final class MandateVoter extends Voter
{
    public const VIEW = 'MANDATE_VIEW';
    public const EDIT = 'MANDATE_EDIT';
    public const DELETE = 'MANDATE_DELETE';

    protected function supports(string $attribute, mixed $subject): bool
    {
        return $subject instanceof Mandate
            && in_array($attribute, [self::VIEW, self::EDIT, self::DELETE], true);
    }

    protected function voteOnAttribute(
        string $attribute,
        mixed $subject,
        TokenInterface $token,
        ?Vote $vote = null,
    ): bool
    {
        $user = $token->getUser();

        if (!$user instanceof User) return false;

        /** @var Mandate $mandate */
        $mandate = $subject;
        $isOwner = $this->isSameUser($mandate->getMandateGroup()?->getOwner(), $user);
        $isCoordinator = in_array('ROLE_COORDINATOR', $user->getRoles(), true);
        $isAssigned = $this->isSameUser($mandate->getAssignedTo(), $user);

        if ($attribute === self::DELETE) {
            return $isOwner;
        }

        if ($attribute === self::EDIT) {
            return $isCoordinator || $isAssigned;
        }

        return $isOwner || $isCoordinator || $isAssigned;
    }

    private function isSameUser(?User $left, User $right): bool
    {
        if ($left === null) return false;
        if ($left->getId() !== null && $right->getId() !== null) {
            return $left->getId() === $right->getId();
        }
        return $left->getUuid()->equals($right->getUuid());
    }
}
