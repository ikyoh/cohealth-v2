<?php
// api/src/Serializer/UserOwnedDenormalizer.php

namespace App\Serializer;

use App\Entity\User;
use App\Entity\UserOwnedInterface;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\Serializer\Normalizer\DenormalizerInterface;
use Symfony\Component\Serializer\Normalizer\DenormalizerAwareTrait;
use Symfony\Component\Serializer\Normalizer\DenormalizerAwareInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Security\Http\Attribute\CurrentUser;

class UserOwnedDenormalizer implements DenormalizerInterface, DenormalizerAwareInterface
{

    use DenormalizerAwareTrait;

    private const ALREADY_CALLED_DENORMALIZER = 'UserOwnedDenormalizerCalled';

    public function __construct(private Security $security) {}


    public function supportsDenormalization(mixed $data, string $type, ?string $format = null, array $context = []): bool
    {
        $reflexionClass = new \ReflectionClass($type);
        $alreadyCalled = $context[$this->getAlreadyCalledKey($type)] ?? false;
        return $reflexionClass->implementsInterface(UserOwnedInterface::class) && $alreadyCalled === false;
    }

    public function denormalize(mixed $data, string $type, ?string $format = null, array $context = []): mixed
    {

        $context[$this->getAlreadyCalledKey($type)] = true;
        /** @var UserOwnedInterface $obj */

        $obj = $this->denormalizer->denormalize($data, $type, $format, $context);

        $request = Request::createFromGlobals();
        $method = $request->getMethod();

        if ($method === "POST") {
            $user = $this->security->getUser();
            $obj->setOwner($user);
        }

        return $obj;
    }


    public function getSupportedTypes(?string $format): array
    {
        return ['*' => false];
    }

    private function getAlreadyCalledKey(string $type)
    {
        return self::ALREADY_CALLED_DENORMALIZER . $type;
    }
}
