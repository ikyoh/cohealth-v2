<?php

namespace App\Tests\State;

use ApiPlatform\Metadata\Post;
use ApiPlatform\State\ProcessorInterface;
use App\Entity\Principal;
use App\Entity\User;
use App\Model\PrincipalCategoryEnum;
use App\Repository\PrincipalRepository;
use App\State\UserProcessor;
use PHPUnit\Framework\TestCase;
use Symfony\Component\HttpKernel\Exception\ConflictHttpException;

final class UserProcessorTest extends TestCase
{
    public function testItLinksAnExistingPrincipalByGln(): void
    {
        $user = (new User())
            ->setRoles(['ROLE_PRINCIPAL'])
            ->setIsApproved(true)
            ->setGln('7601000999818')
            ->setRcc('U655325');
        $principal = (new Principal())
            ->setGln('7601000999818')
            ->setRcc('U655325');

        $repository = $this->createMock(PrincipalRepository::class);
        $repository
            ->expects(self::exactly(2))
            ->method('findOneBy')
            ->willReturn($principal);

        $processor = $this->createPersistProcessor($user);
        $result = (new UserProcessor($repository, $processor))->process($user, new Post());

        self::assertSame($user, $result);
        self::assertSame($principal, $user->getPrincipal());
        self::assertSame($user, $principal->getUser());
    }

    public function testItCreatesAPrincipalWhenNoMatchExists(): void
    {
        $user = (new User())
            ->setRoles(['ROLE_PRINCIPAL'])
            ->setIsApproved(true)
            ->setEmail('principal@example.test')
            ->setFirstname('Jane')
            ->setLastname('Doe')
            ->setOrganizationName('Cabinet Jane Doe')
            ->setRcc('A123456')
            ->setGln('7601000000001')
            ->setAddress('Rue de Test 1')
            ->setPostCode('1201')
            ->setCity('Genève')
            ->setPrincipalCategory(PrincipalCategoryEnum::MEDECINE_GENERALE)
            ->setPrincipalCanton('GENEVE')
            ->setIsActive(true);

        $repository = $this->createMock(PrincipalRepository::class);
        $repository
            ->expects(self::exactly(2))
            ->method('findOneBy')
            ->willReturn(null);

        $processor = $this->createPersistProcessor($user);
        (new UserProcessor($repository, $processor))->process($user, new Post());

        $principal = $user->getPrincipal();

        self::assertInstanceOf(Principal::class, $principal);
        self::assertSame('Cabinet Jane Doe', $principal->getName());
        self::assertSame(PrincipalCategoryEnum::MEDECINE_GENERALE, $principal->getCategory());
        self::assertSame('GENEVE', $principal->getCanton());
        self::assertSame($user, $principal->getUser());
    }

    public function testItRejectsAnAlreadyLinkedPrincipal(): void
    {
        $owner = new User();
        $principal = (new Principal())
            ->setGln('7601000999818')
            ->setRcc('U655325')
            ->setUser($owner);
        $user = (new User())
            ->setRoles(['ROLE_PRINCIPAL'])
            ->setIsApproved(true)
            ->setGln('7601000999818');

        $repository = $this->createMock(PrincipalRepository::class);
        $repository->method('findOneBy')->willReturn($principal);

        $this->expectException(ConflictHttpException::class);

        (new UserProcessor($repository, $this->createMock(ProcessorInterface::class)))
            ->process($user, new Post());
    }

    public function testItDoesNotAttachAPrincipalBeforeApproval(): void
    {
        $user = (new User())
            ->setRoles(['ROLE_PRINCIPAL'])
            ->setIsApproved(false)
            ->setGln('7601000999818')
            ->setRcc('U655325');

        $repository = $this->createMock(PrincipalRepository::class);
        $repository
            ->expects(self::never())
            ->method('findOneBy');

        $processor = $this->createPersistProcessor($user);
        (new UserProcessor($repository, $processor))->process($user, new Post());

        self::assertNull($user->getPrincipal());
    }

    private function createPersistProcessor(User $user): ProcessorInterface
    {
        $processor = $this->createMock(ProcessorInterface::class);
        $processor
            ->expects(self::once())
            ->method('process')
            ->willReturn($user);

        return $processor;
    }
}
