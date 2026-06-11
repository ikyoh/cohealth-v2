<?php

namespace App\DataFixtures;

use App\Entity\User;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Bundle\FixturesBundle\FixtureGroupInterface;
use Doctrine\Persistence\ObjectManager;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

final class PhysioFixtures extends Fixture implements FixtureGroupInterface
{
    private const USERS = [
        ['Emma', 'Dubois', 'Genève', '1201'],
        ['Lucas', 'Martin', 'Lausanne', '1003'],
        ['Chloé', 'Bernard', 'Fribourg', '1700'],
        ['Hugo', 'Petit', 'Sion', '1950'],
        ['Léa', 'Robert', 'Neuchâtel', '2000'],
        ['Louis', 'Richard', 'Delémont', '2800'],
        ['Manon', 'Durand', 'Berne', '3000'],
        ['Nathan', 'Moreau', 'Bâle', '4001'],
        ['Camille', 'Simon', 'Lugano', '6900'],
        ['Jules', 'Laurent', 'Zurich', '8001'],
    ];

    public function __construct(
        private readonly UserPasswordHasherInterface $hasher,
    ) {
    }

    public static function getGroups(): array
    {
        return ['physio'];
    }

    public function load(ObjectManager $manager): void
    {
        $repository = $manager->getRepository(User::class);

        foreach (self::USERS as $index => [$firstname, $lastname, $city, $postCode]) {
            $number = $index + 1;
            $email = sprintf('physio%02d@cohealth.test', $number);
            $user = $repository->findOneBy(['email' => $email]);

            if (!$user instanceof User) {
                $user = new User();
                $user->setEmail($email);
                $manager->persist($user);
            }

            $user
                ->setFirstname($firstname)
                ->setLastname($lastname)
                ->setRoles(['ROLE_PHYSIO'])
                ->setPassword($this->hasher->hashPassword($user, 'password'))
                ->setOrganizationName('CoHealth Physio')
                ->setRCC(sprintf('P%06d', $number))
                ->setGLN(sprintf('7602000000%03d', $number))
                ->setMobile(sprintf('+4179100%04d', $number))
                ->setAddress(sprintf('Rue de la Physiothérapie %d', $number))
                ->setPostCode($postCode)
                ->setCity($city)
                ->setCountry('Suisse')
                ->setIsActive(true)
                ->setIsApproved(true)
                ->setIsOptin(false);
        }

        $manager->flush();
    }
}
