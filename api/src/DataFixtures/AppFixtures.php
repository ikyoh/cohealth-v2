<?php

namespace App\DataFixtures;

use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use App\Entity\User;

class AppFixtures extends Fixture
{

    private UserPasswordHasherInterface $hasher;

    public function __construct(UserPasswordHasherInterface $hasher)
    {
        $this->hasher = $hasher;
    }


    public function load(ObjectManager $manager): void
    {

        $users = [];

        $user = new User();
        $hasher = $this->hasher->hashPassword($user, "password");

        $user = new User();
        $user->setFirstname("Christophe")
            ->setLastname("Giacomini")
            ->setEmail("ohsito@user.com")
            ->setRoles(['ROLE_NURSE'])
            ->setPassword($hasher)
            ->setRCC("C111111")
            ->setGLN("1111111111111")
            ->setMobile("+33612345678")
            ->setAddress("109 H quai de la Banquière")
            ->setPostCode("06730")
            ->setCity("Saint André de la Roche")
            ->setCountry("France")
            ->setIsApproved(true)
            ->setIsOptin(true)
            ->setIsActive(true);
        $manager->persist($user);
        $users[] = $user;

        $manager->flush();

        // Lecture du fichier users.csv
        $csvUsers = __DIR__ . '/csv/users.csv';
        if (!file_exists($csvUsers)) {
            throw new \RuntimeException('Fichier CSV non trouvé : ' . $csvUsers);
        }

        $handle = fopen($csvUsers, 'r');
        if (!$handle) {
            throw new \RuntimeException('Impossible d\'ouvrir le fichier CSV.');
        }

        while (($row = fgetcsv($handle, 0, ';')) !== false) {
            $user = new User();
            $plainPassword = $row[2] ?? 'password';

            $user->setEmail($row[0])
                ->setRoles(!empty($row[1]) ? explode(',', $row[1]) : ['ROLE_NURSE'])
                ->setPassword($this->hasher->hashPassword($user, $plainPassword))
                ->setFirstname($row[3])
                ->setLastname($row[4] ?? null)
                ->setOrganizationName($row[5] ?? null)
                ->setRCC($row[6] ?? null)
                ->setGLN($row[7] ?? null)
                ->setMobile($row[8] ?? null)
                ->setPhone($row[9] ?? null)
                ->setFax($row[10] ?? null)
                ->setAddress($row[11])
                ->setPostCode($row[12] ?? null)
                ->setCity($row[13] ?? null)
                ->setCountry($row[14])
                ->setIsActive((bool) ($row[15] ?? true))
                ->setIsOptin((bool) ($row[16] ?? true))
                ->setIsApproved((bool) ($row[17] ?? true));

            $manager->persist($user);
            $users[] = $user;
        }
        fclose($handle);
        $manager->flush();

        $patientFirstnames = ['Lina', 'Noah', 'Mila', 'Leo', 'Ines', 'Nina', 'Lucas', 'Eva', 'Hugo', 'Lea'];
        $patientLastnames = ['Dubois', 'Meyer', 'Favre', 'Roux', 'Perrin', 'Schmid', 'Morel', 'Girard', 'Blanc', 'Rey'];
        $patientCities = [
            ['npa' => '1201', 'city' => 'Geneve', 'canton' => \App\Model\CantonEnum::GENEVE],
            ['npa' => '1003', 'city' => 'Lausanne', 'canton' => \App\Model\CantonEnum::VAUD],
            ['npa' => '1700', 'city' => 'Fribourg', 'canton' => \App\Model\CantonEnum::FRIBOURG],
            ['npa' => '1950', 'city' => 'Sion', 'canton' => \App\Model\CantonEnum::VALAIS],
            ['npa' => '2000', 'city' => 'Neuchatel', 'canton' => \App\Model\CantonEnum::NEUCHATEL],
            ['npa' => '2800', 'city' => 'Delemont', 'canton' => \App\Model\CantonEnum::JURA],
            ['npa' => '3000', 'city' => 'Berne', 'canton' => \App\Model\CantonEnum::BERNE],
            ['npa' => '4001', 'city' => 'Bale', 'canton' => \App\Model\CantonEnum::BALE_VILLE],
            ['npa' => '6900', 'city' => 'Lugano', 'canton' => \App\Model\CantonEnum::TESSIN],
            ['npa' => '8001', 'city' => 'Zurich', 'canton' => \App\Model\CantonEnum::ZURICH],
        ];

        $patientIndex = 1;
        foreach ($users as $user) {
            for ($i = 0; $i < 10; $i++) {
                $city = $patientCities[$i];
                $patient = new \App\Entity\Patient();
                $patient->setFirstname($patientFirstnames[$i])
                    ->setLastname($patientLastnames[$i])
                    ->setGender($i % 2 === 0 ? \App\Model\GenderEnum::FEMALE : \App\Model\GenderEnum::MALE)
                    ->setPhone('+4122000' . str_pad((string) $patientIndex, 4, '0', STR_PAD_LEFT))
                    ->setMobile('+4179000' . str_pad((string) $patientIndex, 4, '0', STR_PAD_LEFT))
                    ->setCanton($city['canton'])
                    ->setNpa($city['npa'])
                    ->setCity($city['city'])
                    ->setAddress('Rue des Patients ' . $patientIndex)
                    ->setEmail('patient' . str_pad((string) $patientIndex, 3, '0', STR_PAD_LEFT) . '@cohealth.test')
                    ->setAvsNumber('756' . str_pad((string) $patientIndex, 10, '0', STR_PAD_LEFT))
                    ->setInsuranceNumber('INS-' . str_pad((string) $patientIndex, 5, '0', STR_PAD_LEFT))
                    ->setBirthDate((new \DateTime('1940-01-01'))->modify('+' . $patientIndex . ' days'))
                    ->setOwner($user);

                $manager->persist($patient);
                $patientIndex++;
            }
        }
        $manager->flush();

        // Lecture du fichier services.csv
        $csvServices = __DIR__ . '/csv/services.csv';
        if (!file_exists($csvServices)) {
            throw new \RuntimeException('Fichier CSV non trouvé : ' . $csvServices);
        }

        $handle = fopen($csvServices, 'r');
        if (!$handle) {
            throw new \RuntimeException('Impossible d\'ouvrir le fichier CSV.');
        }

        while (($row = fgetcsv($handle, 0, ';')) !== false) {

            $service = new \App\Entity\Service();
            $service->setName($row[0] ?? null);
            $service->setFamily($row[1] ?? null);
            $service->setActNumber(!empty($row[3]) ? (int)$row[2] : null);
            $service->setCategory($row[3] ?? null);
            $service->setDuration($row[4]);
            $service->setDescription($row[5] ?? null);
            $service->setOpas($row[6] ?? null);
            $service->setIsActive(isset($row[7]) ? (bool)$row[7] : null);

            $manager->persist($service);
        }
        fclose($handle);
        $manager->flush();


        // Lecture du fichier insurances.csv
        $csvInsurances = __DIR__ . '/csv/insurances.csv';
        if (!file_exists($csvInsurances)) {
            throw new \RuntimeException('Fichier CSV non trouvé : ' . $csvInsurances);
        }

        $handle = fopen($csvInsurances, 'r');
        if (!$handle) {
            throw new \RuntimeException('Impossible d\'ouvrir le fichier CSV.');
        }

        while (($row = fgetcsv($handle, 0, ';')) !== false) {

            $insurance = new \App\Entity\Insurance();
            $insurance->setName($row[2]);
            $insurance->setOrganization($row[3] ?? null);
            $insurance->setCategory(\App\Model\InsuranceCategoryEnum::from(trim($row[4])));
            $insurance->setAddress($row[5] ?? null);
            $insurance->setAdditionalAddress($row[6] ?? null);
            $insurance->setNpa($row[7] ?? null);
            $insurance->setCity($row[8]);
            $insurance->setPhone($row[9] ?? null);
            $insurance->setEmail($row[10] ?? null);
            $insurance->setWebsite($row[11] ?? null);
            $insurance->setGln($row[12] ?? null);

            $manager->persist($insurance);
        }
        fclose($handle);
        $manager->flush();


        // Lecture du fichier principals.csv
        $csvPrincipals = __DIR__ . '/csv/principals.csv';
        if (!file_exists($csvPrincipals)) {
            throw new \RuntimeException('Fichier CSV non trouvé : ' . $csvPrincipals);
        }

        $handle = fopen($csvPrincipals, 'r');
        if (!$handle) {
            throw new \RuntimeException('Impossible d\'ouvrir le fichier CSV.');
        }

        while (($row = fgetcsv($handle, 0, ';')) !== false) {

            $principal = new \App\Entity\Principal();
            $principal->setCategory(\App\Model\PrincipalCategoryEnum::from($row[2]));
            $principal->setName($row[3]);
            $principal->setFurtherInformations($row[4] ?? null);
            $principal->setNpa($row[9] ?? null);
            $principal->setCity($row[10] ?? null);
            $principal->setCanton($row[11] ?? null);
            $principal->setAddress($row[12] ?? null);
            $principal->setAdditionalAddress(null);
            $principal->setPhone($row[5] ?? null);
            $principal->setMobile($row[6] ?? null);
            $principal->setEmail($row[7] ?? null);
            $principal->setRcc($row[14] ?? null);
            $principal->setGln($row[15] ?? null);
            $principal->setIsActive(true);

            $manager->persist($principal);
        }
        fclose($handle);
        $manager->flush();
    }
}
