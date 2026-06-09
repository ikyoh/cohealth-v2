<?php

namespace App\Security\Voter;

use App\Entity\Principal;
use App\Entity\User;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Authorization\Voter\Vote;
use Symfony\Component\Security\Core\Authorization\Voter\Voter;

final class PrincipalVoter extends Voter
{
    public const EDIT = 'PRINCIPAL_EDIT';

    protected function supports(string $attribute, mixed $subject): bool
    {
        return $attribute === self::EDIT && $subject instanceof Principal;
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

        /** @var Principal $principal */
        $principal = $subject;
        $owner = $principal->getUser();

        if ($owner === null) {
            return true;
        }

        if ($owner->getId() !== null && $user->getId() !== null) {
            return $owner->getId() === $user->getId();
        }

        return $owner->getUuid()->equals($user->getUuid());
    }
}
