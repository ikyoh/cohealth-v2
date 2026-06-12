<?php

namespace App\Tests\State;

use ApiPlatform\Metadata\Post;
use ApiPlatform\State\ProcessorInterface;
use App\Entity\Event;
use App\Entity\Mission;
use App\Entity\User;
use App\Repository\UserRepository;
use App\State\EventProcessor;
use Doctrine\ORM\EntityManagerInterface;
use PHPUnit\Framework\TestCase;
use Symfony\Bundle\SecurityBundle\Security;

final class EventProcessorTest extends TestCase
{
    public function testItSynchronizesUniqueCooperatorsFromServices(): void
    {
        $cooperator = new User();
        $iri = '/users/' . $cooperator->getUuid();
        $event = (new Event())->setServices([
            ['cooperator' => ['@id' => $iri]],
            ['cooperator' => ['@id' => $iri]],
            ['name' => 'Sans attribution'],
        ]);

        $repository = $this->createMock(UserRepository::class);
        $repository
            ->expects(self::exactly(2))
            ->method('findOneBy')
            ->willReturn($cooperator);

        $persistProcessor = $this->createMock(ProcessorInterface::class);
        $persistProcessor
            ->expects(self::once())
            ->method('process')
            ->willReturn($event);
        $entityManager = $this->createMock(EntityManagerInterface::class);
        $security = $this->createMock(Security::class);
        $security->method('getUser')->willReturn($cooperator);

        $result = (new EventProcessor($repository, $entityManager, $security, $persistProcessor))
            ->process($event, new Post());

        self::assertSame($event, $result);
        self::assertCount(1, $event->getCooperators());
        self::assertTrue($event->getCooperators()->contains($cooperator));
    }

    public function testCooperatorCreatingMissionEventIsAssignedWhileMissionOwnerRemainsReferent(): void
    {
        $referent = new User();
        $cooperator = new User();
        $mission = (new Mission())->setOwner($referent);
        $event = (new Event())
            ->setMission($mission)
            ->setOwner($cooperator)
            ->setServices([['name' => 'Soin', 'duration' => 30]]);

        $repository = $this->createMock(UserRepository::class);
        $repository->method('findOneBy')->willReturn($cooperator);
        $entityManager = $this->createMock(EntityManagerInterface::class);
        $security = $this->createMock(Security::class);
        $security->method('getUser')->willReturn($cooperator);
        $persistProcessor = $this->createMock(ProcessorInterface::class);
        $persistProcessor->method('process')->willReturn($event);

        (new EventProcessor($repository, $entityManager, $security, $persistProcessor))
            ->process($event, new Post());

        self::assertSame($referent, $event->getOwner());
        self::assertSame(
            '/users/' . $cooperator->getUuid(),
            $event->getServices()[0]['cooperator']['@id'],
        );
        self::assertTrue($event->getCooperators()->contains($cooperator));
    }
}
