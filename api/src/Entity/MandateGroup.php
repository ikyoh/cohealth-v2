<?php

namespace App\Entity;

use ApiPlatform\Doctrine\Orm\Filter\SearchFilter;
use ApiPlatform\Doctrine\Orm\Filter\OrderFilter;
use ApiPlatform\Metadata\ApiFilter;
use ApiPlatform\Metadata\ApiProperty;
use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Delete;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Patch;
use ApiPlatform\Metadata\Post;
use App\Model\MandateGroupStatusEnum;
use App\Repository\MandateGroupRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Bridge\Doctrine\Types\UuidType;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Uid\Uuid;
use Symfony\Component\Validator\Constraints as Assert;

#[ORM\Entity(repositoryClass: MandateGroupRepository::class)]
#[ApiResource(
    normalizationContext: ['groups' => ['mandate_groups:read']],
    denormalizationContext: ['groups' => ['mandate_group:write']],
    operations: [
        new Get(security: "is_granted('MANDATE_GROUP_VIEW', object)"),
        new GetCollection(security: "is_granted('ROLE_USER')"),
        new Post(
            security: "is_granted('ROLE_PRINCIPAL')",
        ),
        new Patch(security: "is_granted('MANDATE_GROUP_EDIT', object)"),
        new Delete(security: "is_granted('MANDATE_GROUP_EDIT', object)"),
    ],
)]
#[ApiFilter(SearchFilter::class, properties: [
    'status' => 'exact',
    'mandates.status' => 'exact',
    'mandates.assignedTo' => 'exact',
])]
#[ApiFilter(OrderFilter::class, properties: ['createdAt', 'status'])]
class MandateGroup implements UserOwnedInterface
{
    #[ORM\Id]
    #[ApiProperty(identifier: false)]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['mandate_groups:read'])]
    private ?int $id = null;

    #[ApiProperty(identifier: true)]
    #[ORM\Column(type: UuidType::NAME, unique: true)]
    #[ORM\CustomIdGenerator(class: 'doctrine.uuid_generator')]
    #[Groups(['mandate_groups:read'])]
    private Uuid $uuid;

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['mandate_groups:read'])]
    private ?User $owner = null;

    #[ORM\Column]
    #[Groups(['mandate_groups:read', 'mandate_group:write'])]
    #[Assert\Collection(fields: [
        'firstname' => new Assert\Required([new Assert\NotBlank(), new Assert\Length(max: 255)]),
        'lastname' => new Assert\Required([new Assert\NotBlank(), new Assert\Length(max: 255)]),
    ], allowExtraFields: true)]
    private array $patient = [];

    /**
     * @var Collection<int, Mandate>
     */
    #[ORM\OneToMany(
        mappedBy: 'mandateGroup',
        targetEntity: Mandate::class,
        cascade: ['persist', 'remove'],
        orphanRemoval: true,
    )]
    #[Groups(['mandate_groups:read', 'mandate_group:write'])]
    #[Assert\Count(min: 1, minMessage: 'Ajoutez au moins un mandat.')]
    #[Assert\Valid]
    private Collection $mandates;

    #[ORM\Column(enumType: MandateGroupStatusEnum::class)]
    #[Groups(['mandate_groups:read'])]
    private MandateGroupStatusEnum $status = MandateGroupStatusEnum::EDITED;

    #[ORM\Column]
    #[Groups(['mandate_groups:read'])]
    private \DateTimeImmutable $createdAt;

    public function __construct()
    {
        $this->uuid = Uuid::v7();
        $this->mandates = new ArrayCollection();
        $this->createdAt = new \DateTimeImmutable();
    }

    public function getId(): ?int { return $this->id; }
    public function getUuid(): Uuid { return $this->uuid; }
    public function getOwner(): ?User { return $this->owner; }
    public function setOwner(?User $owner): static { $this->owner = $owner; return $this; }
    public function getPatient(): array { return $this->patient; }
    public function setPatient(array $patient): static { $this->patient = $patient; return $this; }
    /** @return Collection<int, Mandate> */
    public function getMandates(): Collection { return $this->mandates; }
    public function addMandate(Mandate $mandate): static
    {
        if (!$this->mandates->contains($mandate)) {
            $this->mandates->add($mandate);
            $mandate->setMandateGroup($this);
        }
        return $this;
    }
    public function removeMandate(Mandate $mandate): static
    {
        if ($this->mandates->removeElement($mandate) && $mandate->getMandateGroup() === $this) {
            $mandate->setMandateGroup(null);
        }
        return $this;
    }
    public function getStatus(): MandateGroupStatusEnum { return $this->status; }
    public function setStatus(MandateGroupStatusEnum $status): static { $this->status = $status; return $this; }
    public function getCreatedAt(): \DateTimeImmutable { return $this->createdAt; }
}
