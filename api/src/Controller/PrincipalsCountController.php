<?php

namespace App\Controller;

use App\Repository\PrincipalRepository;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpKernel\Attribute\AsController;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;

#[AsController]
class PrincipalsCountController extends AbstractController
{

    public function __construct(private PrincipalRepository $repository)
    {
        $this->repository = $repository;
    }

    public function __invoke(): JsonResponse
    {
        $count = $this->repository->count();
        return new JsonResponse(['count' => $count]);
    }
}
