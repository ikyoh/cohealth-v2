<?php

namespace App\Entity;

use Doctrine\DBAL\Types\Types;
use Symfony\Component\Uid\Uuid;
use Doctrine\ORM\Mapping as ORM;
use App\Entity\UserOwnedInterface;
use ApiPlatform\Metadata\ApiProperty;
use ApiPlatform\Metadata\ApiResource;
use App\Model\PrescriptionStatusEnum;
use App\Model\PrescriptionCategoryEnum;
use App\Repository\PrescriptionRepository;
use Symfony\Bridge\Doctrine\Types\UuidType;
use App\Controller\PrescriptionsCountController;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\Put;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Patch;
use ApiPlatform\Metadata\Delete;
use ApiPlatform\Metadata\ApiFilter;
use ApiPlatform\Metadata\GetCollection;

#[ORM\Entity(repositoryClass: PrescriptionRepository::class)]
#[
    ApiResource(
        mercure: true,
        operations: [
            new Get(
                security: "object.getMission() ? is_granted('MISSION_VIEW', object.getMission()) : object.getOwner() == user"
            ),
            new Put(
                security: "object.getMission() ? is_granted('MISSION_EDIT', object.getMission()) : object.getOwner() == user"
            ),
            new Patch(
                security: "object.getMission() ? is_granted('MISSION_EDIT', object.getMission()) : object.getOwner() == user"
            ),
            new Delete(
                security: "object.getMission() ? is_granted('MISSION_EDIT', object.getMission()) : object.getOwner() == user"
            ),
            new GetCollection(security: "is_granted('ROLE_USER')"),
            new Post(
                securityPostDenormalize: "object.getMission() ? is_granted('MISSION_EDIT', object.getMission()) : object.getOwner() == user"
            ),
            new Get(
                name: 'prescriptions_count',
                uriTemplate: '/count/prescriptions',
                controller: PrescriptionsCountController::class,
                read: false,
                security: "is_granted('ROLE_USER')"
            )
        ]
    )
]
class Prescription implements UserOwnedInterface
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

    #[ORM\Column(enumType: PrescriptionCategoryEnum::class)]
    private ?PrescriptionCategoryEnum $category = null;

    #[ORM\Column(type: 'json', nullable: true)]
    private ?array $content = null;

    #[ORM\Column]
    private ?\DateTimeImmutable $createdDate = null;

    #[ORM\Column(nullable: true)]
    private ?\DateTimeImmutable $signedDate = null;

    #[ORM\ManyToOne(inversedBy: 'prescriptions')]
    #[ORM\JoinColumn(nullable: false)]
    private ?User $owner = null;

    #[ORM\Column(enumType: PrescriptionStatusEnum::class)]
    private ?PrescriptionStatusEnum $status = null;

    #[ORM\OneToOne(mappedBy: 'opas', cascade: ['persist', 'remove'])]
    private ?Mission $mission = null;

    #[ORM\ManyToOne(inversedBy: 'prescriptions')]
    #[ORM\JoinColumn(nullable: false)]
    private ?Patient $patient = null;

    #[ORM\Column(type: Types::DATE_MUTABLE)]
    private ?\DateTime $beginDate = null;

    #[ORM\Column(type: Types::DATE_MUTABLE)]
    private ?\DateTime $endDate = null;

    public function __construct()
    {
        $this->uuid = Uuid::v7();
        $this->createdDate = new \DateTimeImmutable();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getUuid(): ?Uuid
    {
        return $this->uuid;
    }

    public function getCategory(): ?PrescriptionCategoryEnum
    {
        return $this->category;
    }

    public function setCategory(PrescriptionCategoryEnum $category): static
    {
        $this->category = $category;

        return $this;
    }

    public function getContent(): ?array
    {
        return $this->content;
    }

    public function setContent(?array $content): static
    {
        $this->content = $content;

        return $this;
    }

    public function getCreatedDate(): ?\DateTimeImmutable
    {
        return $this->createdDate;
    }

    public function setCreatedDate(\DateTimeImmutable $createdDate): static
    {
        $this->createdDate = $createdDate;

        return $this;
    }

    public function getSignedDate(): ?\DateTimeImmutable
    {
        return $this->signedDate;
    }

    public function setSignedDate(?\DateTimeImmutable $signedDate): static
    {
        $this->signedDate = $signedDate;

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

    public function getStatus(): ?PrescriptionStatusEnum
    {
        return $this->status;
    }

    public function setStatus(PrescriptionStatusEnum $status): static
    {
        $this->status = $status;

        return $this;
    }

    public function getMission(): ?Mission
    {
        return $this->mission;
    }

    public function isPlanned(): bool
    {
        return $this->mission !== null && !$this->mission->getEvents()->isEmpty();
    }

    public function setMission(?Mission $mission): static
    {
        // unset the owning side of the relation if necessary
        if ($mission === null && $this->mission !== null) {
            $this->mission->setOpas(null);
        }

        // set the owning side of the relation if necessary
        if ($mission !== null && $mission->getOpas() !== $this) {
            $mission->setOpas($this);
        }

        $this->mission = $mission;

        return $this;
    }

    public function getPatient(): ?Patient
    {
        return $this->patient;
    }

    public function setPatient(?Patient $patient): static
    {
        $this->patient = $patient;

        return $this;
    }

    public function getBeginDate(): ?\DateTime
    {
        return $this->beginDate;
    }

    public function setBeginDate(\DateTime $beginDate): static
    {
        $this->beginDate = $beginDate;

        return $this;
    }

    public function getEndDate(): ?\DateTime
    {
        return $this->endDate;
    }

    public function setEndDate(\DateTime $endDate): static
    {
        $this->endDate = $endDate;

        return $this;
    }
}
