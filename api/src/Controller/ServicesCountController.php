<?php

namespace App\Controller;

use App\Repository\ServiceRepository;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpKernel\Attribute\AsController;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;

#[AsController]
class ServicesCountController extends AbstractController
{

    public function __construct(private ServiceRepository $repository)
    {
        $this->repository = $repository;
    }

    public function __invoke(): JsonResponse
    {
        $this->denyAccessUnlessGranted('ROLE_ADMIN');

        $count = $this->repository->count();
        return new JsonResponse(['count' => $count]);
    }
}
