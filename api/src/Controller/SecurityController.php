<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Routing\Annotation\Route;

class SecurityController extends AbstractController
{
    #[Route('/api/login', name: 'api_login')]
    public function login()
    {
        $user = $this->getUser();
        return $this->json([
            'firstname' => $user->getFirstname(),
            'lastname' => $user->getLastname(),
            'roles' => $user->getRoles(),
        ]);
    }

    #[Route('/auth/logout', name: 'api_logout', methods: ['POST'])]
    public function logout() {}
}
