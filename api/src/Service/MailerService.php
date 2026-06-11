<?php

namespace App\Service;

use App\Entity\User;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Bridge\Twig\Mime\TemplatedEmail;
use Symfony\Component\Mime\Email;

final class MailerService
{
    private const FROM = 'info@cohealth.ch';

    public function __construct(private readonly MailerInterface $mailer)
    {
    }

    public function send(string $htmlContent): void
    {
        $email = (new Email())
            ->from(self::FROM)
            ->to('info@cohealth.ch')
            ->subject('CoHealth - Nouveau message')
            ->html($htmlContent);

        $this->mailer->send($email);
    }

    public function sendRegistrationConfirmation(User $user): void
    {
        $email = (new TemplatedEmail())
            ->from(self::FROM)
            ->to((string) $user->getEmail())
            ->subject('CoHealth - Confirmation de votre inscription')
            ->htmlTemplate('emails/registration_confirmation.html.twig')
            ->context([
                'user' => $user,
            ]);

        $this->mailer->send($email);
    }

    public function sendPasswordReset(User $user, string $resetUrl): void
    {
        $email = (new TemplatedEmail())
            ->from(self::FROM)
            ->to((string) $user->getEmail())
            ->subject('CoHealth - Réinitialisation de votre mot de passe')
            ->htmlTemplate('emails/password_reset.html.twig')
            ->context([
                'user' => $user,
                'resetUrl' => $resetUrl,
            ]);

        $this->mailer->send($email);
    }
}
