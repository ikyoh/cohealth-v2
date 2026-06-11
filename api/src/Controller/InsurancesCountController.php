<?php

namespace App\Controller;

use App\Repository\InsuranceRepository;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpKernel\Attribute\AsController;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;

#[AsController]
class InsurancesCountController extends AbstractController
{

    public function __construct(private InsuranceRepository $repository)
    {
        $this->repository = $repository;
    }

    public function __invoke(): JsonResponse
    {
        $count = $this->repository->count();
        return new JsonResponse(['count' => $count]);
    }
}
