<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use App\Repository\PrincipalRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use App\Controller\PrincipalsCountController;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\Put;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Patch;
use ApiPlatform\Metadata\Delete;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\ApiProperty;
use Symfony\Bridge\Doctrine\Types\UuidType;
use Symfony\Component\Uid\Uuid;
use App\Model\PrincipalCategoryEnum;
use ApiPlatform\Metadata\ApiFilter;
use ApiPlatform\Doctrine\Orm\Filter\OrderFilter;
use App\Filter\MultipleFieldsSearchFilter;
use Symfony\Component\Serializer\Annotation\Groups;

/**
 * Entity for doctors / hospitals
 */
#[ORM\Entity(repositoryClass: PrincipalRepository::class)]
#[
  ApiResource(
    mercure: true,
    normalizationContext: ['groups' => ['principal:read']],
    denormalizationContext: ['groups' => ['principal:write']],
    operations: [
      new Get(),
      new Put(security: "is_granted('PRINCIPAL_EDIT', object)"),
      new Patch(security: "is_granted('PRINCIPAL_EDIT', object)"),
      new Delete(security: "is_granted('PRINCIPAL_EDIT', object)"),
      new GetCollection(),
      new Post(),
      new Get(
        name: 'principals_count',
        uriTemplate: '/count/principals',
        controller: PrincipalsCountController::class,
        read: false
      )
    ]
  )
]
#[ApiFilter(MultipleFieldsSearchFilter::class, properties: [
  "id",
  "uuid",
  "name",
  "rcc",
  "gln",
  "city",
  "canton",
  "npa",
])]



class Principal
{
  #[ORM\Id]
  #[ApiProperty(identifier: false)]
  #[ORM\GeneratedValue]
  #[ORM\Column]
  #[Groups(["principal:read"])]
  private ?int $id = null;

  #[ApiProperty(identifier: true)]
  #[ORM\Column(type: UuidType::NAME, unique: true)]
  #[ORM\CustomIdGenerator(class: 'doctrine.uuid_generator')]
  #[Groups(["principal:read"])]
  private Uuid $uuid;

  #[ORM\Column(length: 255)]
  #[Groups(["principal:read", "principal:write"])]
  private ?string $name = null;

  #[ORM\Column(enumType: PrincipalCategoryEnum::class)]
  #[Groups(["principal:read", "principal:write"])]
  private ?PrincipalCategoryEnum $category = null;

  #[ORM\Column(length: 255, nullable: true)]
  #[Groups(["principal:read", "principal:write"])]
  private ?string $phone = null;

  #[ORM\Column(length: 255, nullable: true)]
  #[Groups(["principal:read", "principal:write"])]
  private ?string $fax = null;

  #[ORM\Column(length: 255, nullable: true)]
  #[Groups(["principal:read", "principal:write"])]
  private ?string $mobile = null;

  #[ORM\Column(length: 255, nullable: true)]
  #[Groups(["principal:read", "principal:write"])]
  private ?string $email = null;

  #[ORM\Column(length: 4)]
  #[Groups(["principal:read", "principal:write"])]
  private ?string $npa = null;

  #[ORM\Column(length: 255)]
  #[Groups(["principal:read", "principal:write"])]
  private ?string $city = null;

  #[ORM\Column(length: 255)]
  #[Groups(["principal:read", "principal:write"])]
  private ?string $canton = null;

  #[ORM\Column(length: 255, nullable: true)]
  #[Groups(["principal:read", "principal:write"])]
  private ?string $address = null;

  #[ORM\Column(length: 255, nullable: true)]
  #[Groups(["principal:read", "principal:write"])]
  private ?string $additionalAddress = null;

  #[ORM\Column(length: 7)]
  #[Groups(["principal:read", "principal:write"])]
  private ?string $rcc = null;

  #[ORM\Column(length: 13)]
  #[Groups(["principal:read", "principal:write"])]
  private ?string $gln = null;

  #[ORM\Column(length: 255, nullable: true)]
  #[Groups(["principal:read", "principal:write"])]
  private ?string $furtherInformations = null;

  #[ORM\Column]
  #[Groups(["principal:read", "principal:write"])]
  private ?bool $isActive = null;

  #[ORM\OneToOne(targetEntity: User::class, mappedBy: 'principal')]
  #[Groups(["principal:read"])]
  private ?User $user = null;

  /**
   * @var Collection<int, Patient>
   */
  #[ORM\OneToMany(targetEntity: Patient::class, mappedBy: 'principal')]
  private Collection $patients;

  public function __construct()
  {
    $this->uuid = Uuid::v7();
    $this->patients = new ArrayCollection();
  }

  public function getId(): ?int
  {
    return $this->id;
  }

  public function getUuid(): ?Uuid
  {
    return $this->uuid;
  }

  public function getName(): ?string
  {
    return $this->name;
  }

  public function setName(string $name): static
  {
    $this->name = $name;

    return $this;
  }

  public function getCategory(): ?PrincipalCategoryEnum
  {
    return $this->category;
  }

  public function setCategory(PrincipalCategoryEnum $category): static
  {
    $this->category = $category;

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

  public function getFax(): ?string
  {
    return $this->fax;
  }

  public function setFax(?string $fax): static
  {
    $this->fax = $fax;

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

  public function getEmail(): ?string
  {
    return $this->email;
  }

  public function setEmail(?string $email): static
  {
    $this->email = $email;

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

  public function getCanton(): ?string
  {
    return $this->canton;
  }

  public function setCanton(string $canton): static
  {
    $this->canton = $canton;

    return $this;
  }

  public function getAddress(): ?string
  {
    return $this->address;
  }

  public function setAddress(?string $address): static
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

  public function getRcc(): ?string
  {
    return $this->rcc;
  }

  public function setRcc(string $rcc): static
  {
    $this->rcc = $rcc;

    return $this;
  }

  public function getGln(): ?string
  {
    return $this->gln;
  }

  public function setGln(string $gln): static
  {
    $this->gln = $gln;

    return $this;
  }

  public function getFurtherInformations(): ?string
  {
    return $this->furtherInformations;
  }

  public function setFurtherInformations(?string $furtherInformations): static
  {
    $this->furtherInformations = $furtherInformations;

    return $this;
  }

  public function getIsActive(): ?bool
  {
    return $this->isActive;
  }

  public function setIsActive(bool $isActive): static
  {
    $this->isActive = $isActive;

    return $this;
  }

  public function getUser(): ?User
  {
    return $this->user;
  }

  public function setUser(?User $user): static
  {
    if ($this->user === $user) {
      return $this;
    }

    $previousUser = $this->user;
    $this->user = $user;

    if ($previousUser?->getPrincipal() === $this) {
      $previousUser->setPrincipal(null);
    }

    if ($user !== null && $user->getPrincipal() !== $this) {
      $user->setPrincipal($this);
    }

    return $this;
  }

  /**
   * @return Collection<int, Patient>
   */
  public function getPatients(): Collection
  {
    return $this->patients;
  }

  public function addPatient(Patient $patient): static
  {
    if (!$this->patients->contains($patient)) {
      $this->patients->add($patient);
      $patient->setPrincipal($this);
    }

    return $this;
  }

  public function removePatient(Patient $patient): static
  {
    if ($this->patients->removeElement($patient)) {
      // set the owning side to null (unless already changed)
      if ($patient->getPrincipal() === $this) {
        $patient->setPrincipal(null);
      }
    }

    return $this;
  }
}
