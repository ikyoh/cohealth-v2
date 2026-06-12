<?php

namespace App\Entity;

use ApiPlatform\Doctrine\Orm\Filter\SearchFilter;
use ApiPlatform\Metadata\ApiFilter;
use ApiPlatform\Metadata\ApiProperty;
use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Delete;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Patch;
use App\Model\MandateCategoryEnum;
use App\Model\MandateStatusEnum;
use App\Repository\MandateRepository;
use App\State\MandateProcessor;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Bridge\Doctrine\Types\UuidType;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Uid\Uuid;
use Symfony\Component\Validator\Constraints as Assert;

#[ORM\Entity(repositoryClass: MandateRepository::class)]
#[ApiResource(
    normalizationContext: ['groups' => ['mandates:read']],
    denormalizationContext: ['groups' => ['mandate:write']],
    operations: [
        new Get(security: "is_granted('MANDATE_VIEW', object)"),
        new GetCollection(security: "is_granted('ROLE_USER')"),
        new Patch(
            security: "is_granted('MANDATE_EDIT', object)",
            processor: MandateProcessor::class,
        ),
        new Delete(security: "is_granted('MANDATE_DELETE', object)"),
    ],
)]
#[ApiFilter(SearchFilter::class, properties: [
    'status' => 'exact',
    'category' => 'exact',
    'assignedTo' => 'exact',
    'mandateGroup' => 'exact',
])]
class Mandate
{
    #[ORM\Id]
    #[ApiProperty(identifier: false)]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['mandates:read', 'mandate_groups:read'])]
    private ?int $id = null;

    #[ApiProperty(identifier: true)]
    #[ORM\Column(type: UuidType::NAME, unique: true)]
    #[ORM\CustomIdGenerator(class: 'doctrine.uuid_generator')]
    #[Groups(['mandates:read', 'mandate_groups:read'])]
    private Uuid $uuid;

    #[ORM\ManyToOne(inversedBy: 'mandates')]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    #[Groups(['mandates:read'])]
    private ?MandateGroup $mandateGroup = null;

    #[ORM\Column(enumType: MandateCategoryEnum::class)]
    #[Groups(['mandates:read', 'mandate_groups:read', 'mandate_group:write', 'mandate:write'])]
    private MandateCategoryEnum $category = MandateCategoryEnum::NURSING;

    #[ORM\Column(enumType: MandateStatusEnum::class)]
    #[Groups(['mandates:read', 'mandate_groups:read', 'mandate:write'])]
    private MandateStatusEnum $status = MandateStatusEnum::EDITED;

    #[ORM\Column]
    #[Groups(['mandates:read', 'mandate_groups:read'])]
    private \DateTimeImmutable $createdAt;

    #[ORM\Column(nullable: true)]
    #[Groups(['mandates:read', 'mandate_groups:read'])]
    private ?\DateTimeImmutable $acceptedAt = null;

    #[ORM\Column(nullable: true)]
    #[Groups(['mandates:read', 'mandate_groups:read'])]
    private ?\DateTimeImmutable $rejectedAt = null;

    #[ORM\ManyToOne]
    #[Groups(['mandates:read', 'mandate_groups:read', 'mandate:write'])]
    private ?User $assignedTo = null;

    #[ORM\Column(type: Types::DATE_MUTABLE)]
    #[Groups(['mandates:read', 'mandate_groups:read', 'mandate_group:write', 'mandate:write'])]
    private ?\DateTimeInterface $beginDate = null;

    #[ORM\Column(type: Types::TEXT)]
    #[Groups(['mandates:read', 'mandate_groups:read', 'mandate_group:write', 'mandate:write'])]
    #[Assert\NotBlank]
    private ?string $description = null;

    #[ORM\OneToOne]
    #[Groups(['mandates:read', 'mandate_groups:read', 'mandate:write'])]
    private ?Mission $mission = null;

    public function __construct()
    {
        $this->uuid = Uuid::v7();
        $this->createdAt = new \DateTimeImmutable();
    }

    public function getId(): ?int { return $this->id; }
    public function getUuid(): Uuid { return $this->uuid; }
    public function getMandateGroup(): ?MandateGroup { return $this->mandateGroup; }
    public function setMandateGroup(?MandateGroup $mandateGroup): static { $this->mandateGroup = $mandateGroup; return $this; }
    public function getCategory(): MandateCategoryEnum { return $this->category; }
    public function setCategory(MandateCategoryEnum $category): static { $this->category = $category; return $this; }
    public function getStatus(): MandateStatusEnum { return $this->status; }
    public function setStatus(MandateStatusEnum $status): static { $this->status = $status; return $this; }
    public function getCreatedAt(): \DateTimeImmutable { return $this->createdAt; }
    public function getAcceptedAt(): ?\DateTimeImmutable { return $this->acceptedAt; }
    public function setAcceptedAt(?\DateTimeImmutable $acceptedAt): static { $this->acceptedAt = $acceptedAt; return $this; }
    public function getRejectedAt(): ?\DateTimeImmutable { return $this->rejectedAt; }
    public function setRejectedAt(?\DateTimeImmutable $rejectedAt): static { $this->rejectedAt = $rejectedAt; return $this; }
    public function getAssignedTo(): ?User { return $this->assignedTo; }
    public function setAssignedTo(?User $assignedTo): static
    {
        $this->assignedTo = $assignedTo;
        if ($assignedTo !== null) {
            $this->status = MandateStatusEnum::ASSIGNED;
            $this->acceptedAt = null;
            $this->rejectedAt = null;
        }
        return $this;
    }
    public function getBeginDate(): ?\DateTimeInterface { return $this->beginDate; }
    public function setBeginDate(\DateTimeInterface $beginDate): static { $this->beginDate = $beginDate; return $this; }
    public function getDescription(): ?string { return $this->description; }
    public function setDescription(string $description): static { $this->description = trim($description); return $this; }
    public function getMission(): ?Mission { return $this->mission; }
    public function setMission(?Mission $mission): static { $this->mission = $mission; return $this; }
}
