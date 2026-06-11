<?php

namespace App\Security\Voter;

use App\Entity\Patient;
use App\Entity\User;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Authorization\Voter\Voter;

final class PatientVoter extends Voter
{
    public const VIEW = 'PATIENT_VIEW';
    public const EDIT = 'PATIENT_EDIT';
    public const DELETE = 'PATIENT_DELETE';

    protected function supports(string $attribute, mixed $subject): bool
    {
        return $subject instanceof Patient
            && in_array($attribute, [self::VIEW, self::EDIT, self::DELETE], true);
    }

    protected function voteOnAttribute(string $attribute, mixed $subject, TokenInterface $token): bool
    {
        $user = $token->getUser();

        if (!$user instanceof User) {
            return false;
        }

        /** @var Patient $patient */
        $patient = $subject;
        $isOwner = $this->isSameUser($patient->getOwner(), $user);

        if (in_array($attribute, [self::EDIT, self::DELETE], true)) {
            return $isOwner;
        }

        if ($isOwner) {
            return true;
        }

        foreach ($patient->getMissions() as $mission) {
            if ($this->isSameUser($mission->getOwner(), $user)) {
                return true;
            }

            foreach ($mission->getOwners() as $sharedUser) {
                if ($this->isSameUser($sharedUser, $user)) {
                    return true;
                }
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
