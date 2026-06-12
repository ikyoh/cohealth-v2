<?php

namespace App\Tests\Security\Voter;

use App\Entity\Mandate;
use App\Entity\MandateGroup;
use App\Entity\User;
use App\Security\Voter\MandateVoter;
use PHPUnit\Framework\TestCase;
use Symfony\Component\Security\Core\Authentication\Token\UsernamePasswordToken;
use Symfony\Component\Security\Core\Authorization\Voter\VoterInterface;

final class MandateVoterTest extends TestCase
{
    public function testOwnerAndAssignedUserCanViewMandate(): void
    {
        $owner = new User();
        $assigned = new User();
        $mandate = (new Mandate())
            ->setMandateGroup((new MandateGroup())->setOwner($owner))
            ->setAssignedTo($assigned);
        $voter = new MandateVoter();

        self::assertSame(
            VoterInterface::ACCESS_GRANTED,
            $voter->vote(new UsernamePasswordToken($owner, 'main', $owner->getRoles()), $mandate, [MandateVoter::VIEW]),
        );
        self::assertSame(
            VoterInterface::ACCESS_GRANTED,
            $voter->vote(new UsernamePasswordToken($assigned, 'main', $assigned->getRoles()), $mandate, [MandateVoter::VIEW]),
        );
    }

    public function testOnlyOwnerCanDeleteMandate(): void
    {
        $owner = new User();
        $assigned = new User();
        $mandate = (new Mandate())
            ->setMandateGroup((new MandateGroup())->setOwner($owner))
            ->setAssignedTo($assigned);
        $voter = new MandateVoter();

        self::assertSame(
            VoterInterface::ACCESS_DENIED,
            $voter->vote(new UsernamePasswordToken($assigned, 'main', $assigned->getRoles()), $mandate, [MandateVoter::DELETE]),
        );
    }

    public function testCoordinatorCanViewAndEditMandate(): void
    {
        $owner = (new User())->setRoles(['ROLE_PRINCIPAL']);
        $coordinator = (new User())->setRoles(['ROLE_COORDINATOR']);
        $mandate = (new Mandate())
            ->setMandateGroup((new MandateGroup())->setOwner($owner));
        $token = new UsernamePasswordToken($coordinator, 'main', $coordinator->getRoles());
        $voter = new MandateVoter();

        self::assertSame(
            VoterInterface::ACCESS_GRANTED,
            $voter->vote($token, $mandate, [MandateVoter::VIEW]),
        );
        self::assertSame(
            VoterInterface::ACCESS_GRANTED,
            $voter->vote($token, $mandate, [MandateVoter::EDIT]),
        );
        self::assertSame(
            VoterInterface::ACCESS_DENIED,
            $voter->vote($token, $mandate, [MandateVoter::DELETE]),
        );
    }

    public function testPrincipalCannotEditMandateAfterEmission(): void
    {
        $owner = (new User())->setRoles(['ROLE_PRINCIPAL']);
        $mandate = (new Mandate())
            ->setMandateGroup((new MandateGroup())->setOwner($owner));
        $voter = new MandateVoter();

        self::assertSame(
            VoterInterface::ACCESS_DENIED,
            $voter->vote(
                new UsernamePasswordToken($owner, 'main', $owner->getRoles()),
                $mandate,
                [MandateVoter::EDIT],
            ),
        );
    }
}
