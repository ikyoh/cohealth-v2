<?php

declare(strict_types=1);

namespace App\Controller;

use Symfony\Component\HttpFoundation\Response;

final class ValidatePasswordTokenController
{
    public function __invoke(): Response
    {
        return new Response('', Response::HTTP_NO_CONTENT);
    }
}
