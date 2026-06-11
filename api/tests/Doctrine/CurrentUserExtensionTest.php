<?php

namespace App\Tests\Doctrine;

use ApiPlatform\Doctrine\Orm\Util\QueryNameGeneratorInterface;
use App\Doctrine\CurrentUserExtension;
use App\Entity\Event;
use App\Entity\Observation;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\ORM\QueryBuilder;
use PHPUnit\Framework\TestCase;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\RequestStack;

final class CurrentUserExtensionTest extends TestCase
{
    public function testGeneralPlanningOnlyIncludesOwnedOrAssignedEvents(): void
    {
        $queryBuilder = $this->createEventQueryBuilder();
        $extension = $this->createExtension(new Request());

        $extension->applyToCollection(
            $queryBuilder,
            $this->createMock(QueryNameGeneratorInterface::class),
            Event::class,
        );

        $dql = $queryBuilder->getDQL();

        self::assertStringContainsString('eventGeneralOwner.uuid = :currentUserUuid', $dql);
        self::assertStringContainsString(':currentUser MEMBER OF event.cooperators', $dql);
        self::assertStringNotContainsString('eventAclMissionOwner', $dql);
    }

    public function testMissionPlanningIncludesEveryEventVisibleThroughTheMission(): void
    {
        $queryBuilder = $this->createEventQueryBuilder();
        $extension = $this->createExtension(new Request(['mission' => '/missions/test']));

        $extension->applyToCollection(
            $queryBuilder,
            $this->createMock(QueryNameGeneratorInterface::class),
            Event::class,
        );

        $dql = $queryBuilder->getDQL();

        self::assertStringContainsString('eventAclMissionOwner.uuid = :currentUserUuid', $dql);
        self::assertStringContainsString(':currentUser MEMBER OF eventAclMission.owners', $dql);
    }

    public function testObservationsAreRestrictedToVisibleMissions(): void
    {
        $queryBuilder = (new QueryBuilder($this->createMock(EntityManagerInterface::class)))
            ->select('observation')
            ->from(Observation::class, 'observation');
        $extension = $this->createExtension(new Request());

        $extension->applyToCollection(
            $queryBuilder,
            $this->createMock(QueryNameGeneratorInterface::class),
            Observation::class,
        );

        $dql = $queryBuilder->getDQL();

        self::assertStringContainsString('observationAclOwner.uuid = :currentUserUuid', $dql);
        self::assertStringContainsString('observationAclMissionOwner.uuid = :currentUserUuid', $dql);
        self::assertStringContainsString(':currentUser MEMBER OF observationAclMission.owners', $dql);
    }

    private function createExtension(Request $request): CurrentUserExtension
    {
        $user = new User();
        $security = $this->createMock(Security::class);
        $security->method('getUser')->willReturn($user);

        $requestStack = new RequestStack();
        $requestStack->push($request);

        return new CurrentUserExtension($security, $requestStack);
    }

    private function createEventQueryBuilder(): QueryBuilder
    {
        return (new QueryBuilder($this->createMock(EntityManagerInterface::class)))
            ->select('event')
            ->from(Event::class, 'event');
    }
}
