<?php

namespace App\Tests\Entity;

use App\Entity\Event;
use App\Entity\Mission;
use App\Entity\Prescription;
use PHPUnit\Framework\TestCase;

final class PrescriptionTest extends TestCase
{
    public function testItIsPlannedWhenItsMissionHasEvents(): void
    {
        $prescription = new Prescription();
        $mission = new Mission();
        $prescription->setMission($mission);

        self::assertFalse($prescription->isPlanned());

        $mission->addEvent(new Event());

        self::assertTrue($prescription->isPlanned());
    }
}
