<?php

namespace App\Serializer;

use Symfony\Component\Serializer\Normalizer\DenormalizerInterface;
use Symfony\Component\Serializer\Normalizer\DenormalizerAwareTrait;
use Symfony\Component\Serializer\Normalizer\DenormalizerAwareInterface;

class EmptyIriNormalizer implements DenormalizerInterface, DenormalizerAwareInterface
{
    use DenormalizerAwareTrait;

    private const ALREADY_CALLED = 'EmptyIriNormalizerCalled';

    public function supportsDenormalization(mixed $data, string $type, ?string $format = null, array $context = []): bool
    {
        return !isset($context[self::ALREADY_CALLED]) && is_array($data);
    }

    public function denormalize(mixed $data, string $type, ?string $format = null, array $context = []): mixed
    {
        $context[self::ALREADY_CALLED] = true;
        
        // Nettoyer les IRIs vides dans les données
        if (is_array($data)) {
            $data = $this->cleanEmptyIris($data);
        }
        
        return $this->denormalizer->denormalize($data, $type, $format, $context);
    }

    public function getSupportedTypes(?string $format): array
    {
        return ['*' => false];
    }

    private function cleanEmptyIris(array $data): array
    {
        foreach ($data as $key => $value) {
            // Convertir les chaînes vides en null pour les relations
            if ($value === '') {
                $data[$key] = null;
            }
            // Récursif pour les tableaux imbriqués
            elseif (is_array($value)) {
                $data[$key] = $this->cleanEmptyIris($value);
            }
        }
        
        return $data;
    }
}