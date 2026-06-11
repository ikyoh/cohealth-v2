<?php

namespace App\Security;

use App\Entity\User;
use Symfony\Component\Security\Core\Exception\CustomUserMessageAccountStatusException;
use Symfony\Component\Security\Core\User\UserCheckerInterface;
use Symfony\Component\Security\Core\User\UserInterface;

final class UserChecker implements UserCheckerInterface
{
    public function checkPreAuth(UserInterface $user): void
    {
        if (!$user instanceof User) {
            return;
        }

        if ($user->getIsActive() !== true) {
            throw new CustomUserMessageAccountStatusException(
                'Ce compte est désactivé.',
            );
        }

        if ($user->getIsApproved() !== true) {
            throw new CustomUserMessageAccountStatusException(
                'Votre inscription est en attente d’approbation.',
            );
        }
    }

    public function checkPostAuth(UserInterface $user): void
    {
    }
}
