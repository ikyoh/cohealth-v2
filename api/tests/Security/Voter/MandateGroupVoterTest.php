<?php

namespace App\Tests\Security\Voter;

use App\Entity\MandateGroup;
use App\Entity\User;
use App\Security\Voter\MandateGroupVoter;
use PHPUnit\Framework\TestCase;
use Symfony\Component\Security\Core\Authentication\Token\UsernamePasswordToken;
use Symfony\Component\Security\Core\Authorization\Voter\VoterInterface;

final class MandateGroupVoterTest extends TestCase
{
    public function testCoordinatorCanViewButNotEditGroup(): void
    {
        $coordinator = (new User())->setRoles(['ROLE_COORDINATOR']);
        $group = new MandateGroup();
        $token = new UsernamePasswordToken($coordinator, 'main', $coordinator->getRoles());
        $voter = new MandateGroupVoter();

        self::assertSame(
            VoterInterface::ACCESS_GRANTED,
            $voter->vote($token, $group, [MandateGroupVoter::VIEW]),
        );
        self::assertSame(
            VoterInterface::ACCESS_DENIED,
            $voter->vote($token, $group, [MandateGroupVoter::EDIT]),
        );
    }
}
