<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;
use ApiPlatform\Metadata\ApiProperty;
use ApiPlatform\Metadata\ApiResource;
use App\Repository\ServiceRepository;
use Symfony\Bridge\Doctrine\Types\UuidType;
use Symfony\Component\Uid\Uuid;
use App\Controller\ServicesCountController;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\Put;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Patch;
use ApiPlatform\Metadata\Delete;
use ApiPlatform\Metadata\GetCollection;

#[ORM\Entity(repositoryClass: ServiceRepository::class)]
#[
    ApiResource(
        mercure: true,
        operations: [
            new Get(security: "is_granted('ROLE_USER')"),
            new Put(security: "is_granted('ROLE_ADMIN')"),
            new Patch(security: "is_granted('ROLE_ADMIN')"),
            new Delete(security: "is_granted('ROLE_ADMIN')"),
            new GetCollection(security: "is_granted('ROLE_USER')"),
            new Post(security: "is_granted('ROLE_ADMIN')"),
            new Get(
                name: 'services_count',
                uriTemplate: '/count/services',
                controller: ServicesCountController::class,
                read: false,
                security: "is_granted('ROLE_ADMIN')"
            )
        ]
    )
]
class Service
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

    #[ORM\Column(length: 255)]
    private ?string $family = null;

    #[ORM\Column(length: 1)]
    private ?string $category = null;

    #[ORM\Column]
    private ?int $duration = null;

    #[ORM\Column(length: 1000, nullable: true)]
    private ?string $description = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $opas = null;


    #[ORM\Column]
    private ?int $actNumber = null;

    #[ORM\Column]
    private ?bool $isActive = null;


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

    public function getFamily(): ?string
    {
        return $this->family;
    }

    public function setFamily(string $family): static
    {
        $this->family = $family;

        return $this;
    }


    public function getCategory(): ?string
    {
        return $this->category;
    }

    public function setCategory(string $category): static
    {
        $this->category = $category;

        return $this;
    }

    public function getDuration(): ?int
    {
        return $this->duration;
    }

    public function setDuration(int $duration): static
    {
        $this->duration = $duration;

        return $this;
    }

    public function getDescription(): ?string
    {
        return $this->description;
    }

    public function setDescription(?string $description): static
    {
        $this->description = $description;

        return $this;
    }

    public function getOpas(): ?string
    {
        return $this->opas;
    }

    public function setOpas(?string $opas): static
    {
        $this->opas = $opas;

        return $this;
    }


    public function getActNumber(): ?int
    {
        return $this->actNumber;
    }

    public function setActNumber(int $actNumber): static
    {
        $this->actNumber = $actNumber;

        return $this;
    }

    public function isActive(): ?bool
    {
        return $this->isActive;
    }

    public function setIsActive(bool $isActive): static
    {
        $this->isActive = $isActive;

        return $this;
    }
}
