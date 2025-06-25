<?php

// src/Service/MailerService.php
namespace App\Service;

use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Mime\Email;

class MailerService
{
    private MailerInterface $mailer;

    public function __construct(MailerInterface $mailer)
    {
        $this->mailer = $mailer;
    }

    public function send(string $htmlContent): void
    {
        $email = (new Email())
            ->from('no-reply@cohealth.ch')
            ->to('info@cohealth.ch')
            ->subject("CoHealth - Nouveau message")
            ->html($htmlContent);


        $this->mailer->send($email);
    }
}
