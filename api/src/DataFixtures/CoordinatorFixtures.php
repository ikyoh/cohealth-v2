<?php

namespace App\DataFixtures;

use App\Entity\User;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Bundle\FixturesBundle\FixtureGroupInterface;
use Doctrine\Persistence\ObjectManager;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

final class CoordinatorFixtures extends Fixture implements FixtureGroupInterface
{
    public function __construct(
        private readonly UserPasswordHasherInterface $hasher,
    ) {
    }

    public static function getGroups(): array
    {
        return ['coordinator'];
    }

    public function load(ObjectManager $manager): void
    {
        $repository = $manager->getRepository(User::class);
        $coordinator = $repository->findOneBy(['email' => 'coordinator@cohealth.test']);

        if (!$coordinator instanceof User) {
            $coordinator = new User();
            $coordinator->setEmail('coordinator@cohealth.test');
            $manager->persist($coordinator);
        }

        $coordinator
            ->setFirstname('Coordinateur')
            ->setLastname('CoHealth')
            ->setOrganizationName('CoHealth')
            ->setRoles(['ROLE_COORDINATOR'])
            ->setPassword($this->hasher->hashPassword($coordinator, 'password'))
            ->setAddress('Coordination CoHealth')
            ->setPostCode('1201')
            ->setCity('Genève')
            ->setCountry('Suisse')
            ->setIsActive(true)
            ->setIsApproved(true)
            ->setIsOptin(false);

        $manager->flush();
    }
}
