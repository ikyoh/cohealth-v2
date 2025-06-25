<?php

// src/Controller/SendEmailController.php

namespace App\Controller;

use App\Service\MailerService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\HttpFoundation\Request;

class SendEmailController extends AbstractController
{
    #[Route('/send-email', name: 'send_email', methods: ['POST'])]
    public function sendEmail(Request $request, MailerService $mailerService): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        $htmlContent = $data['htmlContent'] ?? '';

        if (!$htmlContent) {
            return $this->json(['error' => 'Invalid data'], 400);
        }

        $mailerService->send($htmlContent);

        return $this->json(['message' => 'Email sent']);
    }
}
