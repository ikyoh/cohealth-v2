<?php

declare(strict_types=1);

namespace App\Tests\Api;

use ApiPlatform\Symfony\Bundle\Test\ApiTestCase;
use App\Entity\PasswordToken;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

final class ForgotPasswordTest extends ApiTestCase
{
    public function testUserCanResetPasswordWithSingleUseToken(): void
    {
        $client = static::createClient();
        $container = static::getContainer();
        $entityManager = $container->get(EntityManagerInterface::class);
        $passwordHasher = $container->get(UserPasswordHasherInterface::class);

        $user = (new User())
            ->setEmail(sprintf('forgot-password-%s@cohealth.test', bin2hex(random_bytes(4))))
            ->setRoles(['ROLE_ADMIN'])
            ->setFirstname('Test')
            ->setLastname('Password')
            ->setAddress('Rue du Test 1')
            ->setCountry('Suisse')
            ->setIsActive(true)
            ->setIsApproved(true)
            ->setIsOptin(false);
        $user->setPassword($passwordHasher->hashPassword($user, 'old-password'));

        $entityManager->persist($user);
        $entityManager->flush();

        $client->request('POST', '/forgot-password/', [
            'json' => ['email' => $user->getEmail()],
        ]);

        self::assertResponseStatusCodeSame(204);

        $passwordToken = $entityManager
            ->getRepository(PasswordToken::class)
            ->findOneBy(['user' => $user]);

        self::assertInstanceOf(PasswordToken::class, $passwordToken);

        $client->request('GET', '/forgot-password/'.$passwordToken->getToken());
        self::assertResponseStatusCodeSame(204);
        self::assertSame('', $client->getResponse()->getContent());

        $client->request('POST', '/forgot-password/'.$passwordToken->getToken(), [
            'json' => ['password' => 'new-password'],
        ]);

        self::assertResponseStatusCodeSame(204);

        $entityManager->clear();
        $updatedUser = $entityManager->getRepository(User::class)->find($user->getId());

        self::assertInstanceOf(User::class, $updatedUser);
        self::assertTrue($passwordHasher->isPasswordValid($updatedUser, 'new-password'));
        self::assertNull(
            $entityManager->getRepository(PasswordToken::class)->find($passwordToken->getId()),
        );
    }

    public function testUnknownEmailReturnsNeutralResponse(): void
    {
        static::createClient()->request('POST', '/forgot-password/', [
            'json' => ['email' => 'unknown-user@cohealth.test'],
        ]);

        self::assertResponseStatusCodeSame(204);
    }
}
