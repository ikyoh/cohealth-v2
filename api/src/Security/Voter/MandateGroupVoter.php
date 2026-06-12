<?php

namespace App\Security\Voter;

use App\Entity\MandateGroup;
use App\Entity\User;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Authorization\Voter\Vote;
use Symfony\Component\Security\Core\Authorization\Voter\Voter;

final class MandateGroupVoter extends Voter
{
    public const VIEW = 'MANDATE_GROUP_VIEW';
    public const EDIT = 'MANDATE_GROUP_EDIT';

    protected function supports(string $attribute, mixed $subject): bool
    {
        return $subject instanceof MandateGroup
            && in_array($attribute, [self::VIEW, self::EDIT], true);
    }

    protected function voteOnAttribute(
        string $attribute,
        mixed $subject,
        TokenInterface $token,
        ?Vote $vote = null,
    ): bool
    {
        $user = $token->getUser();

        if (!$user instanceof User) {
            return false;
        }

        /** @var MandateGroup $group */
        $group = $subject;

        if (
            $attribute === self::VIEW
            && in_array('ROLE_COORDINATOR', $user->getRoles(), true)
        ) {
            return true;
        }

        if ($this->isSameUser($group->getOwner(), $user)) {
            return true;
        }

        if ($attribute === self::EDIT) {
            return false;
        }

        foreach ($group->getMandates() as $mandate) {
            if ($this->isSameUser($mandate->getAssignedTo(), $user)) {
                return true;
            }
        }

        return false;
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
