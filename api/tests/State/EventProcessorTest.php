<?php

namespace App\Tests\State;

use ApiPlatform\Metadata\Post;
use ApiPlatform\State\ProcessorInterface;
use App\Entity\Event;
use App\Entity\User;
use App\Repository\UserRepository;
use App\State\EventProcessor;
use PHPUnit\Framework\TestCase;

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

        $result = (new EventProcessor($repository, $persistProcessor))
            ->process($event, new Post());

        self::assertSame($event, $result);
        self::assertCount(1, $event->getCooperators());
        self::assertTrue($event->getCooperators()->contains($cooperator));
    }
}
