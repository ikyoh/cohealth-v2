<?php

declare(strict_types=1);

namespace App\EventSubscriber;

use App\Entity\User;
use App\Service\MailerService;
use CoopTilleuls\ForgotPasswordBundle\Event\CreateTokenEvent;
use CoopTilleuls\ForgotPasswordBundle\Event\UpdatePasswordEvent;
use Doctrine\ORM\EntityManagerInterface;
use Psr\Log\LoggerInterface;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;
use Symfony\Component\Mailer\Exception\TransportExceptionInterface;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

final class ForgotPasswordSubscriber implements EventSubscriberInterface
{
    public function __construct(
        private readonly MailerService $mailer,
        private readonly EntityManagerInterface $entityManager,
        private readonly UserPasswordHasherInterface $passwordHasher,
        private readonly LoggerInterface $logger,
        private readonly string $frontendUrl,
    ) {
    }

    public static function getSubscribedEvents(): array
    {
        return [
            CreateTokenEvent::class => 'onCreateToken',
            UpdatePasswordEvent::class => 'onUpdatePassword',
        ];
    }

    public function onCreateToken(CreateTokenEvent $event): void
    {
        $passwordToken = $event->getPasswordToken();
        $user = $passwordToken->getUser();

        if (!$user instanceof User) {
            return;
        }

        $resetUrl = sprintf(
            '%s/reset-password/%s',
            rtrim($this->frontendUrl, '/'),
            rawurlencode((string) $passwordToken->getToken()),
        );

        try {
            $this->mailer->sendPasswordReset($user, $resetUrl);
        } catch (TransportExceptionInterface $exception) {
            $this->logger->error('Unable to send password reset email.', [
                'exception' => $exception,
                'userId' => $user->getId(),
            ]);
        }
    }

    public function onUpdatePassword(UpdatePasswordEvent $event): void
    {
        $user = $event->getPasswordToken()->getUser();
        $password = (string) $event->getPassword();

        if (!$user instanceof User) {
            return;
        }

        if (mb_strlen($password) < 8) {
            throw new UnprocessableEntityHttpException(
                'Le mot de passe doit contenir au moins 8 caractères.',
            );
        }

        $user->setPassword($this->passwordHasher->hashPassword($user, $password));
        $this->entityManager->persist($user);
        $this->entityManager->flush();
    }
}
