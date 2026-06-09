<?php

namespace App\Tests\Security\Voter;

use App\Entity\Principal;
use App\Entity\User;
use App\Security\Voter\PrincipalVoter;
use PHPUnit\Framework\TestCase;
use Symfony\Component\Security\Core\Authentication\Token\UsernamePasswordToken;
use Symfony\Component\Security\Core\Authorization\Voter\VoterInterface;

final class PrincipalVoterTest extends TestCase
{
    public function testOwnerCanEditLinkedPrincipal(): void
    {
        $user = new User();
        $principal = (new Principal())->setUser($user);

        self::assertSame(
            VoterInterface::ACCESS_GRANTED,
            (new PrincipalVoter())->vote(
                new UsernamePasswordToken($user, 'main', $user->getRoles()),
                $principal,
                [PrincipalVoter::EDIT],
            ),
        );
    }

    public function testAnotherUserCannotEditLinkedPrincipal(): void
    {
        $owner = new User();
        $otherUser = new User();
        $principal = (new Principal())->setUser($owner);

        self::assertSame(
            VoterInterface::ACCESS_DENIED,
            (new PrincipalVoter())->vote(
                new UsernamePasswordToken($otherUser, 'main', $otherUser->getRoles()),
                $principal,
                [PrincipalVoter::EDIT],
            ),
        );
    }

    public function testUnlinkedPrincipalKeepsExistingEditAccess(): void
    {
        $user = new User();

        self::assertSame(
            VoterInterface::ACCESS_GRANTED,
            (new PrincipalVoter())->vote(
                new UsernamePasswordToken($user, 'main', $user->getRoles()),
                new Principal(),
                [PrincipalVoter::EDIT],
            ),
        );
    }
}
