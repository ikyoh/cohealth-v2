<?php

namespace App\Tests\Entity;

use App\Entity\Event;
use App\Entity\EventException;
use PHPUnit\Framework\TestCase;

final class EventRecurrenceTest extends TestCase
{
    public function testItAppliesARescheduledOccurrence(): void
    {
        $event = $this->createDailyEvent();
        $event->addException(
            (new EventException())
                ->setOriginalDate(new \DateTimeImmutable('2026-06-11 10:00:00'))
                ->setRescheduledDate(new \DateTimeImmutable('2026-06-11 12:00:00'))
                ->setRescheduledEnd(new \DateTimeImmutable('2026-06-11 12:30:00'))
                ->setTitle('Visite déplacée')
        );

        $occurrences = json_decode($event->getRecurrentEvents(), true, flags: \JSON_THROW_ON_ERROR);
        $exception = array_values(array_filter(
            $occurrences,
            static fn (array $occurrence): bool => $occurrence['isException'],
        ))[0];

        self::assertSame('2026-06-11T12:00:00+00:00', $exception['date']);
        self::assertSame('2026-06-11T12:30:00+00:00', $exception['endDate']);
        self::assertSame('Visite déplacée', $exception['title']);
    }

    public function testItExcludesACancelledOccurrence(): void
    {
        $event = $this->createDailyEvent();
        $event->addException(
            (new EventException())
                ->setOriginalDate(new \DateTimeImmutable('2026-06-11 10:00:00'))
                ->setIsCancelled(true)
        );

        $occurrences = json_decode($event->getRecurrentEvents(), true, flags: \JSON_THROW_ON_ERROR);

        self::assertFalse(array_any(
            $occurrences,
            static fn (array $occurrence): bool => str_starts_with(
                $occurrence['originalDate'],
                '2026-06-11T10:00:00',
            ),
        ));
    }

    public function testSeriesMoveKeepsExceptionOverridesUntouched(): void
    {
        $event = $this->createDailyEvent();
        $exception = (new EventException())
            ->setOriginalDate(new \DateTimeImmutable('2026-06-11 10:00:00'))
            ->setRescheduledDate(new \DateTimeImmutable('2026-06-11 14:00:00'))
            ->setRescheduledEnd(new \DateTimeImmutable('2026-06-11 14:30:00'))
            ->setTitle('Exception personnalisée')
            ->setDescription('Ne doit pas changer')
            ->setServices([['name' => 'Service exceptionnel']]);
        $event->addException($exception);
        $previousRule = (string) $event->getRecurrenceRule();

        $event->setRecurrenceRule(
            "DTSTART:20260610T120000\nRRULE:FREQ=DAILY;UNTIL=20260612T120000"
        );
        $event->realignExceptionAnchors($previousRule);

        self::assertSame('2026-06-11 12:00:00', $exception->getOriginalDate()?->format('Y-m-d H:i:s'));
        self::assertSame('2026-06-11 14:00:00', $exception->getRescheduledDate()?->format('Y-m-d H:i:s'));
        self::assertSame('2026-06-11 14:30:00', $exception->getRescheduledEnd()?->format('Y-m-d H:i:s'));
        self::assertSame('Exception personnalisée', $exception->getTitle());
        self::assertSame('Ne doit pas changer', $exception->getDescription());
        self::assertSame([['name' => 'Service exceptionnel']], $exception->getServices());
    }

    private function createDailyEvent(): Event
    {
        return (new Event())
            ->setBeginDate(new \DateTime('2026-06-10 10:00:00'))
            ->setEndDate(new \DateTime('2026-06-12 10:00:00'))
            ->setRecurrenceRule(
                "DTSTART:20260610T100000\nRRULE:FREQ=DAILY;UNTIL=20260612T100000"
            );
    }
}
