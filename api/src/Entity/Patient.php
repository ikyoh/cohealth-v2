<?php

namespace App\Entity;

use App\Model\CantonEnum;
use App\Model\GenderEnum;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\Put;
use ApiPlatform\Metadata\Post;
use Doctrine\DBAL\Types\Types;
use ApiPlatform\Metadata\Patch;
use Symfony\Component\Uid\Uuid;
use ApiPlatform\Metadata\Delete;
use Doctrine\ORM\Mapping as ORM;
use App\Entity\UserOwnedInterface;
use ApiPlatform\Metadata\ApiFilter;
use ApiPlatform\Metadata\ApiProperty;
use ApiPlatform\Metadata\ApiResource;
use App\Repository\PatientRepository;
use ApiPlatform\Metadata\GetCollection;
use App\Filter\MultipleFieldsSearchFilter;
use App\Controller\PatientsCountController;
use Doctrine\Common\Collections\Collection;
use Symfony\Bridge\Doctrine\Types\UuidType;
use Doctrine\Common\Collections\ArrayCollection;
use Symfony\Component\Serializer\Annotation\Groups;


#[ORM\Entity(repositoryClass: PatientRepository::class)]
#[ApiFilter(MultipleFieldsSearchFilter::class, properties: ["firstname", "lastname", "avsNumber", "insuranceNumber"])]
#[
  ApiResource(
    mercure: true,
    normalizationContext: ['groups' => ['patients:read']],
    denormalizationContext: ['groups' => ['patient:write']],
    operations: [
      new Get(
        normalizationContext: ['groups' => ['patient:read']],
        security: "is_granted('PATIENT_VIEW', object)"
      ),
      new Put(security: "is_granted('PATIENT_EDIT', object)"),
      new Patch(security: "is_granted('PATIENT_EDIT', object)"),
      new Delete(security: "is_granted('PATIENT_DELETE', object)"),
      new GetCollection(security: "is_granted('ROLE_USER')"),
      new Post(security: "is_granted('ROLE_USER')"),
      new Get(
        name: 'patients_count',
        uriTemplate: '/count/patients',
        controller: PatientsCountController::class,
        read: false,
        security: "is_granted('ROLE_USER')"
      )
    ]
  )
]
class Patient implements UserOwnedInterface
{
  #[ORM\Id]
  #[ApiProperty(identifier: false)]
  #[ORM\GeneratedValue]
  #[ORM\Column]
  #[Groups(["patient:write", "patients:read", "patient:read"])]
  private ?int $id = null;

  #[ApiProperty(identifier: true)]
  #[ORM\Column(type: UuidType::NAME, unique: true)]
  #[ORM\CustomIdGenerator(class: 'doctrine.uuid_generator')]
  #[Groups(["patient:write", "patients:read", "patient:read"])]
  private Uuid $uuid;

  #[ORM\Column(length: 255)]
  #[Groups(["patient:write", "patients:read", "patient:read"])]
  private ?string $firstname = null;

  #[ORM\Column(length: 255)]
  #[Groups(["patient:write", "patients:read", "patient:read"])]
  private ?string $lastname = null;

  #[ORM\Column(enumType: GenderEnum::class)]
  #[Groups(["patient:write", "patients:read", "patient:read"])]
  private ?GenderEnum $gender = null;

  #[ORM\Column(length: 255, nullable: true)]
  #[Groups(["patient:write", "patient:read"])]
  private ?string $phone = null;

  #[ORM\Column(length: 255, nullable: true)]
  #[Groups(["patient:write", "patient:read"])]
  private ?string $mobile = null;

  #[ORM\Column(enumType: CantonEnum::class)]
  #[Groups(["patient:write", "patient:read"])]
  private ?CantonEnum $canton = null;

  #[ORM\Column(length: 4)]
  #[Groups(["patient:write", "patient:read"])]
  private ?string $npa = null;

  #[ORM\Column(length: 255)]
  #[Groups(["patient:write", "patient:read"])]
  private ?string $city = null;

  #[ORM\Column(length: 255)]
  #[Groups(["patient:write", "patient:read"])]
  private ?string $address = null;

  #[ORM\Column(length: 255, nullable: true)]
  #[Groups(["patient:write", "patient:read"])]
  private ?string $additionalAddress = null;

  #[ORM\Column(length: 255, nullable: true)]
  #[Groups(["patient:write", "patient:read"])]
  private ?string $email = null;

  #[ORM\Column(length: 13)]
  #[Groups(["patient:write", "patient:read"])]
  private ?string $avsNumber = null;

  #[ORM\Column(length: 20, nullable: true)]
  #[Groups(["patient:write", "patient:read"])]
  private ?string $insuranceNumber = null;

  #[ORM\Column(type: Types::DATE_MUTABLE)]
  #[Groups(["patient:write", "patient:read"])]
  private ?\DateTime $birthDate = null;

  /**
   * @var Collection<int, Mission>
   */
  #[ORM\OneToMany(targetEntity: Mission::class, mappedBy: 'patient', orphanRemoval: true)]
  #[Groups(["patient:write", "patient:read"])]
  private Collection $missions;

  #[ORM\ManyToOne(inversedBy: 'patients')]
  #[ORM\JoinColumn(nullable: false)]
  #[Groups(["patient:write", "patients:read", "patient:read"])]
  private ?User $owner = null;

  /**
   * @var Collection<int, Prescription>
   */
  #[ORM\OneToMany(targetEntity: Prescription::class, mappedBy: 'patient')]
  private Collection $prescriptions;

  #[ORM\ManyToOne]
  #[ORM\JoinColumn(nullable: true)]
  #[Groups(["patient:write", "patients:read", "patient:read"])]
  private ?Insurance $insurance = null;

  #[ORM\ManyToOne(inversedBy: 'patients')]
  #[ORM\JoinColumn(nullable: true)]
  #[Groups(["patient:write", "patients:read", "patient:read"])]
  private ?Principal $principal = null;

  public function __construct()
  {
    $this->uuid = Uuid::v7();
    $this->missions = new ArrayCollection();
    $this->prescriptions = new ArrayCollection();
  }

  #[Groups(["patients:read", "patient:read"])]
  public function getPrincipalName(): ?string
  {
    return $this->principal ? $this->principal->getName() : null;
  }
  #[Groups(["patients:read", "patient:read"])]
  public function getInsuranceName(): ?string
  {
    return $this->insurance ? $this->insurance->getName() : null;
  }

  public function getId(): ?int
  {
    return $this->id;
  }

  public function getUuid(): ?Uuid
  {
    return $this->uuid;
  }

  public function getGender(): ?GenderEnum
  {
    return $this->gender;
  }

  public function setGender(GenderEnum $gender): static
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

  public function getCanton(): ?CantonEnum
  {
    return $this->canton;
  }

  public function setCanton(CantonEnum $canton): static
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
    return $this->additionalAddress;
  }

  public function setAdditionalAddress(?string $additionalAddress): static
  {
    $this->additionalAddress = $additionalAddress;

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

  public function getInsuranceNumber(): ?string
  {
    return $this->insuranceNumber;
  }

  public function setInsuranceNumber(?string $insuranceNumber): static
  {
    $this->insuranceNumber = $insuranceNumber;

    return $this;
  }

  public function getBirthDate(): ?\DateTime
  {
    return $this->birthDate;
  }

  public function setBirthDate(\DateTime $birthDate): static
  {
    $this->birthDate = $birthDate;

    return $this;
  }

  /**
   * @return Collection<int, Mission>
   */
  public function getMissions(): Collection
  {
    return $this->missions;
  }

  public function addMission(Mission $mission): static
  {
    if (!$this->missions->contains($mission)) {
      $this->missions->add($mission);
      $mission->setPatient($this);
    }

    return $this;
  }

  public function removeMission(Mission $mission): static
  {
    if ($this->missions->removeElement($mission)) {
      // set the owning side to null (unless already changed)
      if ($mission->getPatient() === $this) {
        $mission->setPatient(null);
      }
    }

    return $this;
  }

  public function getOwner(): ?User
  {
    return $this->owner;
  }

  public function setOwner(?User $owner): static
  {
    $this->owner = $owner;

    return $this;
  }

  /**
   * @return Collection<int, Prescription>
   */
  public function getPrescriptions(): Collection
  {
    return $this->prescriptions;
  }

  public function addPrescription(Prescription $prescription): static
  {
    if (!$this->prescriptions->contains($prescription)) {
      $this->prescriptions->add($prescription);
      $prescription->setPatient($this);
    }

    return $this;
  }

  public function removePrescription(Prescription $prescription): static
  {
    if ($this->prescriptions->removeElement($prescription)) {
      // set the owning side to null (unless already changed)
      if ($prescription->getPatient() === $this) {
        $prescription->setPatient(null);
      }
    }

    return $this;
  }

  public function getInsurance(): ?Insurance
  {
    return $this->insurance;
  }

  public function setInsurance(?Insurance $insurance): static
  {
    $this->insurance = $insurance;

    return $this;
  }

  public function getPrincipal(): ?Principal
  {
    return $this->principal;
  }

  public function setPrincipal(?Principal $principal): static
  {
    $this->principal = $principal;

    return $this;
  }
}
