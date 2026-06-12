<?php

namespace App\Tests\State;

use ApiPlatform\Metadata\Patch;
use ApiPlatform\State\ProcessorInterface;
use App\Entity\Mandate;
use App\Entity\MandateGroup;
use App\Entity\User;
use App\Model\MandateGroupStatusEnum;
use App\Model\MandateStatusEnum;
use App\State\MandateProcessor;
use PHPUnit\Framework\TestCase;
use Symfony\Bundle\SecurityBundle\Security;

final class MandateProcessorTest extends TestCase
{
    public function testAcceptedMandateGetsTimestamp(): void
    {
        $assigned = new User();
        $group = new MandateGroup();
        $mandate = (new Mandate())
            ->setAssignedTo($assigned)
            ->setStatus(MandateStatusEnum::ASSIGNED);
        $group->addMandate($mandate);
        $previous = clone $mandate;
        $mandate->setStatus(MandateStatusEnum::ACCEPTED);
        $persistProcessor = $this->createMock(ProcessorInterface::class);
        $persistProcessor->method('process')->willReturn($mandate);
        $security = $this->createMock(Security::class);
        $security->method('getUser')->willReturn($assigned);

        (new MandateProcessor($persistProcessor, $security))->process(
            $mandate,
            new Patch(),
            context: ['previous_data' => $previous],
        );

        self::assertNotNull($mandate->getAcceptedAt());
        self::assertNull($mandate->getRejectedAt());
        self::assertSame(MandateGroupStatusEnum::COMPLETED, $group->getStatus());
    }

    public function testCoordinatorCanAssignActiveCooperator(): void
    {
        $coordinator = (new User())->setRoles(['ROLE_COORDINATOR']);
        $cooperator = (new User())
            ->setRoles(['ROLE_NURSE'])
            ->setIsActive(true)
            ->setIsApproved(true);
        $group = new MandateGroup();
        $mandate = new Mandate();
        $group->addMandate($mandate);
        $previous = clone $mandate;
        $mandate->setAssignedTo($cooperator);
        $persistProcessor = $this->createMock(ProcessorInterface::class);
        $persistProcessor->method('process')->willReturn($mandate);
        $security = $this->createMock(Security::class);
        $security->method('getUser')->willReturn($coordinator);

        (new MandateProcessor($persistProcessor, $security))->process(
            $mandate,
            new Patch(),
            context: ['previous_data' => $previous],
        );

        self::assertSame($cooperator, $mandate->getAssignedTo());
        self::assertSame(MandateStatusEnum::ASSIGNED, $mandate->getStatus());
        self::assertSame(MandateGroupStatusEnum::IN_PROGRESS, $group->getStatus());
    }
}
