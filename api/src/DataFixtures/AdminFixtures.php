<?php

namespace App\DataFixtures;

use App\Entity\User;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

final class AdminFixtures extends Fixture
{
    public function __construct(
        private readonly UserPasswordHasherInterface $hasher,
    ) {
    }

    public function load(ObjectManager $manager): void
    {
        $repository = $manager->getRepository(User::class);
        $admin = $repository->findOneBy(['email' => 'admin@cohealth.test']);

        if (!$admin instanceof User) {
            $admin = new User();
            $admin
                ->setEmail('admin@cohealth.test')
                ->setFirstname('Administrateur')
                ->setLastname('CoHealth')
                ->setOrganizationName('CoHealth')
                ->setRCC('A000001')
                ->setGLN('7601000000099')
                ->setAddress('Administration CoHealth')
                ->setPostCode('1201')
                ->setCity('Genève')
                ->setCountry('Suisse')
                ->setIsActive(true)
                ->setIsApproved(true)
                ->setIsOptin(false);

            $manager->persist($admin);
        }

        $admin->setRoles(['ROLE_ADMIN']);
        $admin->setPassword($this->hasher->hashPassword($admin, 'password'));

        $manager->flush();
    }
}
