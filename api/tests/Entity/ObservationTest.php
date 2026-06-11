<?php

namespace App\Tests\Entity;

use App\Entity\Observation;
use App\Entity\User;
use PHPUnit\Framework\TestCase;

final class ObservationTest extends TestCase
{
    public function testItExposesTheObservationAuthorName(): void
    {
        $author = (new User())
            ->setFirstname('Alice')
            ->setLastname('Martin');
        $observation = (new Observation())->setOwner($author);

        self::assertSame('Alice Martin', $observation->getAuthorName());
    }
}
