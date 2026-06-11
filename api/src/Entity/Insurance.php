<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use App\Repository\InsuranceRepository;
use Doctrine\ORM\Mapping as ORM;
use App\Controller\InsurancesCountController;
use App\Model\InsuranceCategoryEnum;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\Put;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Patch;
use ApiPlatform\Metadata\Delete;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\ApiProperty;
use Symfony\Bridge\Doctrine\Types\UuidType;
use Symfony\Component\Uid\Uuid;
use App\Filter\MultipleFieldsSearchFilter;
use ApiPlatform\Metadata\ApiFilter;
use ApiPlatform\Doctrine\Orm\Filter\OrderFilter;
use ApiPlatform\Doctrine\Orm\Filter\SearchFilter;


#[ORM\Entity(repositoryClass: InsuranceRepository::class)]
#[
  ApiResource(
    mercure: true,
    operations: [
      new Get(),
      new Put(),
      new Patch(),
      new Delete(),
      new GetCollection(),
      new Post(),
      new Get(
        name: 'insurances_count',
        uriTemplate: '/count/insurances',
        controller: InsurancesCountController::class,
        read: false
      )
    ]
  )
]
#[ApiFilter(MultipleFieldsSearchFilter::class, properties: ["id", "name", "organization", "gln"])]
#[ApiFilter(SearchFilter::class, properties: ['category' => 'exact'])]
#[ApiFilter(OrderFilter::class, properties: ['id', 'name', 'organization', 'category', 'gln', 'email', 'phone'])]

class Insurance
{
  #[ORM\Id]
  #[ApiProperty(identifier: false)]
  #[ORM\GeneratedValue]
  #[ORM\Column]
  private ?int $id = null;

  #[ApiProperty(identifier: true)]
  #[ORM\Column(type: UuidType::NAME, unique: true)]
  #[ORM\CustomIdGenerator(class: 'doctrine.uuid_generator')]
  private Uuid $uuid;

  #[ORM\Column(length: 255)]
  private ?string $name = null;

  #[ORM\Column(length: 255, nullable: true)]
  private ?string $organization = null;

  #[ORM\Column(enumType: InsuranceCategoryEnum::class)]
  private ?InsuranceCategoryEnum $category = null;

  #[ORM\Column(length: 255, nullable: true)]
  private ?string $address = null;

  #[ORM\Column(length: 255, nullable: true)]
  private ?string $additionalAddress = null;

  #[ORM\Column(length: 10)]
  private ?string $npa = null;

  #[ORM\Column(length: 255)]
  private ?string $city = null;

  #[ORM\Column(length: 255, nullable: true)]
  private ?string $phone = null;

  #[ORM\Column(length: 255, nullable: true)]
  private ?string $email = null;

  #[ORM\Column(length: 255, nullable: true)]
  private ?string $website = null;

  #[ORM\Column(length: 13)]
  private ?string $gln = null;

  public function __construct()
  {
    $this->uuid = Uuid::v7();
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

  public function getOrganization(): ?string
  {
    return $this->organization;
  }

  public function setOrganization(?string $organization): static
  {
    $this->organization = $organization;

    return $this;
  }

  public function getCategory(): ?InsuranceCategoryEnum
  {
    return $this->category;
  }

  public function setCategory(InsuranceCategoryEnum $category): static
  {
    $this->category = $category;

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

  public function getPhone(): ?string
  {
    return $this->phone;
  }

  public function setPhone(?string $phone): static
  {
    $this->phone = $phone;

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

  public function getWebsite(): ?string
  {
    return $this->website;
  }

  public function setWebsite(?string $website): static
  {
    $this->website = $website;

    return $this;
  }

  public function getGln(): ?string
  {
    return $this->gln;
  }

  public function setGln(?string $gln): static
  {
    $this->gln = $gln;

    return $this;
  }
}
