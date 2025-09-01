<?php

namespace App\Entity;

use App\Model\CantonEnum;
use App\Model\GenderEnum;
use App\Repository\PatientRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;


#[ORM\Entity(repositoryClass: PatientRepository::class)]
class Patient
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(enumType: GenderEnum::class)]
    private ?GenderEnum $gender = null;

    #[ORM\Column(length: 255)]
    private ?string $firstname = null;

    #[ORM\Column(length: 255)]
    private ?string $lastname = null;

    #[ORM\Column(type: Types::DATE_MUTABLE)]
    private ?\DateTimeInterface $birthAt = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $phone = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $mobile = null;

    #[ORM\Column(enumType: CantonEnum::class)]
    private ?CantonEnum $canton = null;

    #[ORM\Column(length: 4)]
    private ?string $npa = null;

    #[ORM\Column(length: 255)]
    private ?string $city = null;

    #[ORM\Column(length: 255)]
    private ?string $address = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $additional_address = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $email = null;

    #[ORM\Column(length: 13)]
    private ?string $avsNumber = null;

    #[ORM\Column(length: 20, nullable: true)]
    private ?string $assuranceNumber = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    /**
     * @return Gender[]
     */
    public function getGender(): array
    {
        return $this->gender;
    }

    public function setGender(array $gender): static
    {
        $this->gender = $gender;

        return $this;
    }

    public function getFirstname(): ?string
    {
        return $this->firstname;
    }

    public function setFirstname(string $firstname): static
    {
        $this->firstname = $firstname;

        return $this;
    }

    public function getLastname(): ?string
    {
        return $this->lastname;
    }

    public function setLastname(string $lastname): static
    {
        $this->lastname = $lastname;

        return $this;
    }

    public function getBirthAt(): ?\DateTimeInterface
    {
        return $this->birthAt;
    }

    public function setBirthAt(\DateTimeInterface $birthAt): static
    {
        $this->birthAt = $birthAt;

        return $this;
    }

    public function getPhone(): ?string
    {
        return $this->phone;
    }

    public function setPhone(?string $phone): static
    {
        $this->phone = $phone;

        return $this;
    }

    public function getMobile(): ?string
    {
        return $this->mobile;
    }

    public function setMobile(?string $mobile): static
    {
        $this->mobile = $mobile;

        return $this;
    }

    public function getCanton(): ?Canton
    {
        return $this->canton;
    }

    public function setCanton(Canton $canton): static
    {
        $this->canton = $canton;

        return $this;
    }

    public function getNpa(): ?string
    {
        return $this->npa;
    }

    public function setNpa(string $npa): static
    {
        $this->npa = $npa;

        return $this;
    }

    public function getCity(): ?string
    {
        return $this->city;
    }

    public function setCity(string $city): static
    {
        $this->city = $city;

        return $this;
    }

    public function getAddress(): ?string
    {
        return $this->address;
    }

    public function setAddress(string $address): static
    {
        $this->address = $address;

        return $this;
    }

    public function getAdditionalAddress(): ?string
    {
        return $this->additional_address;
    }

    public function setAdditionalAddress(?string $additional_address): static
    {
        $this->additional_address = $additional_address;

        return $this;
    }

    public function getEmail(): ?string
    {
        return $this->email;
    }

    public function setEmail(?string $email): static
    {
        $this->email = $email;

        return $this;
    }

    public function getAvsNumber(): ?string
    {
        return $this->avsNumber;
    }

    public function setAvsNumber(string $avsNumber): static
    {
        $this->avsNumber = $avsNumber;

        return $this;
    }

    public function getAssuranceNumber(): ?string
    {
        return $this->assuranceNumber;
    }

    public function setAssuranceNumber(?string $assuranceNumber): static
    {
        $this->assuranceNumber = $assuranceNumber;

        return $this;
    }
}
