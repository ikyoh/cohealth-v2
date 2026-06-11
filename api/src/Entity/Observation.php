<?php

namespace App\Entity;

use ApiPlatform\Doctrine\Orm\Filter\OrderFilter;
use ApiPlatform\Doctrine\Orm\Filter\SearchFilter;
use ApiPlatform\Metadata\ApiFilter;
use ApiPlatform\Metadata\ApiProperty;
use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Delete;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Patch;
use ApiPlatform\Metadata\Post;
use App\Model\ObservationTypeEnum;
use App\Repository\ObservationRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Bridge\Doctrine\Types\UuidType;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Uid\Uuid;
use Symfony\Component\Validator\Constraints as Assert;
use Symfony\Component\Validator\Context\ExecutionContextInterface;

#[ORM\Entity(repositoryClass: ObservationRepository::class)]
#[ApiResource(
    mercure: true,
    normalizationContext: ['groups' => ['observations:read']],
    denormalizationContext: ['groups' => ['observation:write']],
    operations: [
        new Get(security: "is_granted('MISSION_VIEW', object.getMission())"),
        new GetCollection(security: "is_granted('ROLE_USER')"),
        new Post(securityPostDenormalize: "is_granted('MISSION_VIEW', object.getMission())"),
        new Patch(security: "object.getOwner() == user or object.getMission().getOwner() == user"),
        new Delete(security: "object.getOwner() == user or object.getMission().getOwner() == user"),
    ],
)]
#[ApiFilter(SearchFilter::class, properties: ['mission' => 'exact', 'type' => 'exact'])]
#[ApiFilter(OrderFilter::class, properties: ['observedAt', 'createdAt'])]
class Observation implements UserOwnedInterface
{
    #[ORM\Id]
    #[ApiProperty(identifier: false)]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['observations:read'])]
    private ?int $id = null;

    #[ApiProperty(identifier: true)]
    #[ORM\Column(type: UuidType::NAME, unique: true)]
    #[ORM\CustomIdGenerator(class: 'doctrine.uuid_generator')]
    #[Groups(['observations:read'])]
    private Uuid $uuid;

    #[ORM\ManyToOne(inversedBy: 'observations')]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    #[Groups(['observation:write', 'observations:read'])]
    #[Assert\NotNull]
    private ?Mission $mission = null;

    #[ORM\ManyToOne(inversedBy: 'observations')]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    #[Groups(['observations:read'])]
    private ?User $owner = null;

    #[ORM\Column(enumType: ObservationTypeEnum::class)]
    #[Groups(['observation:write', 'observations:read'])]
    #[Assert\NotNull]
    private ?ObservationTypeEnum $type = null;

    #[ORM\Column(type: Types::DATETIME_IMMUTABLE)]
    #[Groups(['observation:write', 'observations:read'])]
    #[Assert\NotNull]
    private ?\DateTimeImmutable $observedAt = null;

    #[ORM\Column(type: Types::DECIMAL, precision: 8, scale: 2, nullable: true)]
    #[Groups(['observation:write', 'observations:read'])]
    private ?string $value = null;

    #[ORM\Column(type: Types::SMALLINT, nullable: true)]
    #[Groups(['observation:write', 'observations:read'])]
    private ?int $systolic = null;

    #[ORM\Column(type: Types::SMALLINT, nullable: true)]
    #[Groups(['observation:write', 'observations:read'])]
    private ?int $diastolic = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    #[Groups(['observation:write', 'observations:read'])]
    private ?string $content = null;

    #[ORM\Column(type: Types::DATETIME_IMMUTABLE)]
    #[Groups(['observations:read'])]
    private \DateTimeImmutable $createdAt;

    public function __construct()
    {
        $this->uuid = Uuid::v7();
        $this->observedAt = new \DateTimeImmutable();
        $this->createdAt = new \DateTimeImmutable();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getUuid(): Uuid
    {
        return $this->uuid;
    }

    public function getMission(): ?Mission
    {
        return $this->mission;
    }

    public function setMission(?Mission $mission): static
    {
        $this->mission = $mission;

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

    #[Groups(['observations:read'])]
    public function getAuthorName(): string
    {
        return trim(sprintf('%s %s', $this->owner?->getFirstname() ?? '', $this->owner?->getLastname() ?? ''));
    }

    public function getType(): ?ObservationTypeEnum
    {
        return $this->type;
    }

    public function setType(ObservationTypeEnum $type): static
    {
        $this->type = $type;

        return $this;
    }

    public function getObservedAt(): ?\DateTimeImmutable
    {
        return $this->observedAt;
    }

    public function setObservedAt(\DateTimeImmutable $observedAt): static
    {
        $this->observedAt = $observedAt;

        return $this;
    }

    public function getValue(): ?string
    {
        return $this->value;
    }

    public function setValue(string|float|int|null $value): static
    {
        $this->value = $value === null ? null : (string) $value;

        return $this;
    }

    public function getSystolic(): ?int
    {
        return $this->systolic;
    }

    public function setSystolic(?int $systolic): static
    {
        $this->systolic = $systolic;

        return $this;
    }

    public function getDiastolic(): ?int
    {
        return $this->diastolic;
    }

    public function setDiastolic(?int $diastolic): static
    {
        $this->diastolic = $diastolic;

        return $this;
    }

    public function getContent(): ?string
    {
        return $this->content;
    }

    public function setContent(?string $content): static
    {
        $this->content = $content;

        return $this;
    }

    public function getCreatedAt(): \DateTimeImmutable
    {
        return $this->createdAt;
    }

    #[Assert\Callback]
    public function validateValueForType(ExecutionContextInterface $context): void
    {
        if ($this->type === null) {
            return;
        }

        if ($this->type === ObservationTypeEnum::TEXT) {
            if (trim($this->content ?? '') === '') {
                $context->buildViolation('Le texte de l’observation est obligatoire.')
                    ->atPath('content')
                    ->addViolation();
            }

            return;
        }

        if ($this->type === ObservationTypeEnum::BLOOD_PRESSURE) {
            if (($this->systolic ?? 0) <= 0) {
                $context->buildViolation('La pression systolique est obligatoire.')
                    ->atPath('systolic')
                    ->addViolation();
            }
            if (($this->diastolic ?? 0) <= 0) {
                $context->buildViolation('La pression diastolique est obligatoire.')
                    ->atPath('diastolic')
                    ->addViolation();
            }

            return;
        }

        if ($this->value === null || (float) $this->value <= 0) {
            $context->buildViolation('La valeur mesurée doit être supérieure à zéro.')
                ->atPath('value')
                ->addViolation();
        }
    }
}
