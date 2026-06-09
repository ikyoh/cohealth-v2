<?php

namespace App\Controller;

use App\Entity\User;
use App\Repository\UserRepository;
use App\Service\MailerService;
use Doctrine\ORM\EntityManagerInterface;
use Psr\Log\LoggerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Mailer\Exception\TransportExceptionInterface;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Attribute\Route;

final class RegistrationController extends AbstractController
{
    private const ALLOWED_ROLES = [
        'ROLE_NURSE',
        'ROLE_PHYSIO',
        'ROLE_PRINCIPAL',
    ];

    public function __construct(
        private readonly UserRepository $repository,
        private readonly EntityManagerInterface $entityManager,
        private readonly UserPasswordHasherInterface $hasher,
        private readonly MailerService $mailer,
        private readonly LoggerInterface $logger,
    ) {
    }

    #[Route('/register', name: 'user_registration', methods: ['POST'])]
    public function __invoke(Request $request): JsonResponse
    {
        $payload = $request->toArray();
        $errors = $this->validatePayload($payload);

        if ($errors !== []) {
            return $this->json(['errors' => $errors], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $email = mb_strtolower(trim((string) $payload['email']));
        $rcc = $this->optionalString($payload['rcc'] ?? null);
        $rcc = $rcc === null ? null : mb_strtoupper($rcc);

        if ($this->repository->findOneBy(['email' => $email]) instanceof User) {
            return $this->json(
                ['errors' => ['email' => 'Un compte existe déjà avec cette adresse email.']],
                Response::HTTP_CONFLICT,
            );
        }

        if ($rcc !== null && $this->repository->findOneBy(['rcc' => $rcc]) instanceof User) {
            return $this->json(
                ['errors' => ['rcc' => 'Ce numéro RCC est déjà utilisé.']],
                Response::HTTP_CONFLICT,
            );
        }

        $user = (new User())
            ->setEmail($email)
            ->setFirstname(trim((string) $payload['firstname']))
            ->setLastname($this->optionalString($payload['lastname'] ?? null))
            ->setOrganizationName($this->optionalString($payload['organizationName'] ?? null))
            ->setRoles([(string) $payload['role']])
            ->setRcc($rcc)
            ->setGln($this->optionalString($payload['gln'] ?? null))
            ->setMobile($this->optionalString($payload['mobile'] ?? null))
            ->setPhone($this->optionalString($payload['phone'] ?? null))
            ->setAddress(trim((string) $payload['address']))
            ->setPostCode(trim((string) $payload['postCode']))
            ->setCity(trim((string) $payload['city']))
            ->setCountry(trim((string) $payload['country']))
            ->setIsActive(true)
            ->setIsApproved(false)
            ->setIsOptin((bool) ($payload['isOptin'] ?? false));

        $user->setPassword(
            $this->hasher->hashPassword($user, (string) $payload['password']),
        );

        $this->entityManager->persist($user);
        $this->entityManager->flush();

        $confirmationEmailSent = true;

        try {
            $this->mailer->sendRegistrationConfirmation($user);
        } catch (TransportExceptionInterface $exception) {
            $confirmationEmailSent = false;
            $this->logger->error('Impossible d’envoyer la confirmation d’inscription.', [
                'userId' => $user->getId(),
                'exception' => $exception,
            ]);
        }

        return $this->json(
            [
                'message' => $confirmationEmailSent
                    ? 'Votre demande d’inscription a bien été enregistrée. Un email de confirmation vous a été envoyé.'
                    : 'Votre demande d’inscription a bien été enregistrée, mais l’email de confirmation n’a pas pu être envoyé.',
                'confirmationEmailSent' => $confirmationEmailSent,
            ],
            Response::HTTP_CREATED,
        );
    }

    /**
     * @return array<string, string>
     */
    private function validatePayload(array $payload): array
    {
        $errors = [];
        $email = trim((string) ($payload['email'] ?? ''));
        $password = (string) ($payload['password'] ?? '');
        $firstname = trim((string) ($payload['firstname'] ?? ''));
        $lastname = trim((string) ($payload['lastname'] ?? ''));
        $role = (string) ($payload['role'] ?? '');
        $address = trim((string) ($payload['address'] ?? ''));
        $postCode = trim((string) ($payload['postCode'] ?? ''));
        $city = trim((string) ($payload['city'] ?? ''));
        $country = trim((string) ($payload['country'] ?? ''));
        $rcc = trim((string) ($payload['rcc'] ?? ''));
        $gln = trim((string) ($payload['gln'] ?? ''));
        $mobile = trim((string) ($payload['mobile'] ?? ''));
        $phone = trim((string) ($payload['phone'] ?? ''));

        if (!filter_var($email, FILTER_VALIDATE_EMAIL) || mb_strlen($email) > 180) {
            $errors['email'] = 'Veuillez saisir une adresse email valide.';
        }

        if (mb_strlen($password) < 8) {
            $errors['password'] = 'Le mot de passe doit contenir au moins 8 caractères.';
        }

        if ($firstname === '') {
            $errors['firstname'] = 'Le prénom est obligatoire.';
        }

        if ($lastname === '') {
            $errors['lastname'] = 'Le nom est obligatoire.';
        }

        if (!in_array($role, self::ALLOWED_ROLES, true)) {
            $errors['role'] = 'La profession sélectionnée n’est pas autorisée.';
        }

        if ($address === '') {
            $errors['address'] = 'L’adresse est obligatoire.';
        }

        if (!preg_match('/^\d{4}$/', $postCode)) {
            $errors['postCode'] = 'Le NPA doit contenir 4 chiffres.';
        }

        if ($city === '') {
            $errors['city'] = 'La ville est obligatoire.';
        }

        if ($country === '') {
            $errors['country'] = 'Le pays est obligatoire.';
        }

        if ($rcc === '') {
            $errors['rcc'] = 'Le RCC est obligatoire.';
        } elseif (!preg_match('/^[a-zA-Z]\d{6}$/', $rcc)) {
            $errors['rcc'] = 'Le RCC doit contenir une lettre suivie de 6 chiffres.';
        }

        if ($gln === '') {
            $errors['gln'] = 'Le GLN est obligatoire.';
        } elseif (!preg_match('/^\d{13}$/', $gln)) {
            $errors['gln'] = 'Le GLN doit contenir 13 chiffres.';
        }

        if (mb_strlen($mobile) > 12) {
            $errors['mobile'] = 'Le numéro de mobile ne peut pas dépasser 12 caractères.';
        }

        if (mb_strlen($phone) > 12) {
            $errors['phone'] = 'Le numéro de téléphone ne peut pas dépasser 12 caractères.';
        }

        return $errors;
    }

    private function optionalString(mixed $value): ?string
    {
        $value = trim((string) $value);

        return $value === '' ? null : $value;
    }
}
