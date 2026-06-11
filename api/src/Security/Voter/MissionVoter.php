<?php

namespace App\Security\Voter;

use App\Entity\Mission;
use App\Entity\User;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Authorization\Voter\Voter;

final class MissionVoter extends Voter
{
    public const VIEW = 'MISSION_VIEW';
    public const EDIT = 'MISSION_EDIT';
    public const MANAGE_SHARING = 'MISSION_MANAGE_SHARING';
    public const DELETE = 'MISSION_DELETE';

    protected function supports(string $attribute, mixed $subject): bool
    {
        return $subject instanceof Mission
            && in_array($attribute, [
                self::VIEW,
                self::EDIT,
                self::MANAGE_SHARING,
                self::DELETE,
            ], true);
    }

    protected function voteOnAttribute(string $attribute, mixed $subject, TokenInterface $token): bool
    {
        $user = $token->getUser();

        if (!$user instanceof User) {
            return false;
        }

        /** @var Mission $mission */
        $mission = $subject;
        $isOwner = $this->isSameUser($mission->getOwner(), $user);

        if (in_array($attribute, [self::EDIT, self::MANAGE_SHARING, self::DELETE], true)) {
            return $isOwner;
        }

        if ($isOwner) {
            return true;
        }

        foreach ($mission->getOwners() as $sharedUser) {
            if ($this->isSameUser($sharedUser, $user)) {
                return true;
            }
        }

        return false;
    }

    private function isSameUser(?User $left, User $right): bool
    {
        if ($left === null) {
            return false;
        }

        if ($left->getId() !== null && $right->getId() !== null) {
            return $left->getId() === $right->getId();
        }

        return $left->getUuid()->equals($right->getUuid());
    }
}
