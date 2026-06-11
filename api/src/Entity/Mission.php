<?php

namespace App\Entity;

use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\Put;
use ApiPlatform\Metadata\Post;
use Doctrine\DBAL\Types\Types;
use ApiPlatform\Metadata\Patch;
use Symfony\Component\Uid\Uuid;
use ApiPlatform\Metadata\Delete;
use App\Model\MissionStatusEnum;
use Doctrine\ORM\Mapping as ORM;
use App\Entity\UserOwnedInterface;
use ApiPlatform\Metadata\ApiProperty;
use ApiPlatform\Metadata\ApiResource;
use App\Repository\MissionRepository;
use ApiPlatform\Metadata\GetCollection;
use App\EntityListener\MissionListener;
use App\Controller\MissionsCountController;
use Doctrine\Common\Collections\Collection;
use Symfony\Bridge\Doctrine\Types\UuidType;
use Doctrine\Common\Collections\ArrayCollection;
use Symfony\Component\Serializer\Annotation\Groups;
use ApiPlatform\Metadata\ApiFilter;
use ApiPlatform\Doctrine\Orm\Filter\OrderFilter;
use App\Filter\MissionUserFilter;
use App\Filter\MultipleFieldsSearchFilter;


#[ORM\Entity(repositoryClass: MissionRepository::class)]
#[ORM\EntityListeners([MissionListener::class])]
#[
  ApiResource(
    mercure: true,
    normalizationContext: ['groups' => ['missions:read']],
    denormalizationContext: ['groups' => ['mission:write']],
    operations: [
      new Get(
        normalizationContext: ['groups' => ['mission:read']],
        security: "is_granted('MISSION_VIEW', object)"
      ),
      new Put(security: "is_granted('MISSION_EDIT', object)"),
      new Patch(security: "is_granted('MISSION_EDIT', object)"),
      new Delete(security: "is_granted('MISSION_DELETE', object)"),
      new GetCollection(security: "is_granted('ROLE_USER')"),
      new Post(
        denormalizationContext: ['groups' => ['mission:write', 'mission:create']],
        security: "is_granted('ROLE_USER')"
      ),
      new Get(
        name: 'missions_count',
        uriTemplate: '/count/missions',
        controller: MissionsCountController::class,
        read: false,
        security: "is_granted('ROLE_USER')"
      )
    ]
  )
]
#[ApiFilter(OrderFilter::class, properties: ['id', 'status', 'patient.lastname'])]
#[ApiFilter(MissionUserFilter::class)]
#[ApiFilter(MultipleFieldsSearchFilter::class, properties: ["id", "description", "status", "patient.firstname", "patient.lastname"])]

class Mission implements UserOwnedInterface
{
  #[ORM\Id]
  #[ApiProperty(identifier: false)]
  #[ORM\GeneratedValue]
  #[ORM\Column]
  #[Groups(["missions:read", "mission:read"])]
  private ?int $id = null;

  #[ApiProperty(identifier: true)]
  #[ORM\Column(type: UuidType::NAME, unique: true)]
  #[ORM\CustomIdGenerator(class: 'doctrine.uuid_generator')]
  #[Groups(["missions:read", "mission:read"])]
  private Uuid $uuid;

  #[ORM\Column(length: 2048, nullable: true)]
  #[Groups(["mission:write", "mission:read"])]
  private ?string $description = null;

  #[ORM\Column(type: Types::DATE_MUTABLE)]
  #[Groups(["mission:write", "missions:read", "mission:read"])]
  private ?\DateTimeInterface $beginDate = null;

  #[ORM\Column(type: Types::DATE_MUTABLE)]
  #[Groups(["mission:write", "missions:read", "mission:read"])]
  private ?\DateTimeInterface $endDate = null;

  #[ORM\ManyToOne(inversedBy: 'missions')]
  #[ORM\JoinColumn(nullable: false)]
  #[Groups(["mission:write", "missions:read", "mission:read"])]
  private ?Patient $patient = null;

  #[ORM\Column(enumType: MissionStatusEnum::class)]
  #[Groups(["mission:write", "missions:read", "mission:read"])]
  private ?MissionStatusEnum $status = null;

  #[ORM\Column]
  #[Groups(["mission:write", "missions:read", "mission:read"])]
  private ?int $duration = null;

  #[ORM\ManyToOne]
  #[ORM\JoinColumn(nullable: false)]
  #[Groups(["mission:write", "missions:read", "mission:read"])]
  private ?Insurance $insurance = null;

  #[ORM\ManyToOne]
  #[ORM\JoinColumn(nullable: false)]
  #[Groups(["mission:write", "missions:read", "mission:read"])]
  private ?Principal $principal = null;

  #[ORM\ManyToOne(inversedBy: 'missions')]
  #[ORM\JoinColumn(nullable: false)]
  #[Groups(["missions:read", "mission:read"])]
  private ?User $owner = null;

  /**
   * @var Collection<int, User>
   */
  #[ORM\ManyToMany(targetEntity: User::class, inversedBy: 'sharedMissions')]
  #[Groups(["mission:create", "missions:read", "mission:read"])]
  private Collection $owners;

  #[ORM\OneToOne(inversedBy: 'mission', cascade: ['persist', 'remove'])]
  #[Groups(["mission:write", "missions:read", "mission:read"])]
  private ?Prescription $opas = null;

  /**
   * @var Collection<int, Event>
   */
  #[ORM\OneToMany(targetEntity: Event::class, mappedBy: 'mission')]
  private Collection $events;

  /**
   * @var Collection<int, Observation>
   */
  #[ORM\OneToMany(targetEntity: Observation::class, mappedBy: 'mission', orphanRemoval: true)]
  private Collection $observations;

  public function __construct()
  {
    $this->uuid = Uuid::v7();
    $this->owners = new ArrayCollection();
    $this->events = new ArrayCollection();
    $this->observations = new ArrayCollection();
  }

  public function getId(): ?int
  {
    return $this->id;
  }

  public function getUuid(): ?Uuid
  {
    return $this->uuid;
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

  public function getBeginDate(): ?\DateTimeInterface
  {
    return $this->beginDate;
  }

  public function setBeginDate(\DateTimeInterface $beginDate): static
  {
    $this->beginDate = $beginDate;

    return $this;
  }

  public function getEndDate(): ?\DateTimeInterface
  {
    return $this->endDate;
  }

  public function setEndDate(\DateTimeInterface $endDate): static
  {
    $this->endDate = $endDate;

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

  public function getStatus(): ?MissionStatusEnum
  {
    return $this->status;
  }

  public function setStatus(MissionStatusEnum $status): static
  {
    $this->status = $status;

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

  public function getOwner(): ?User
  {
    return $this->owner;
  }

  public function setOwner(?User $owner): static
  {
    $this->owner = $owner;

    if ($owner !== null) {
      $this->removeOwner($owner);
    }

    return $this;
  }

  /**
   * @return Collection<int, User>
   */
  public function getOwners(): Collection
  {
    return $this->owners;
  }

  public function addOwner(User $owner): static
  {
    if (!$owner->isCooperator() || $owner->getIsActive() !== true || $owner->getIsApproved() !== true) {
      return $this;
    }

    if (!$this->hasOwner($owner)) {
      $this->owners->add($owner);
    }

    return $this;
  }

  public function removeOwner(User $owner): static
  {
    $ownerIdentity = $this->getOwnerIdentity($owner);

    if ($ownerIdentity === null) {
      $this->owners->removeElement($owner);

      return $this;
    }

    foreach ($this->owners->toArray() as $existingOwner) {
      if ($this->getOwnerIdentity($existingOwner) === $ownerIdentity) {
        $this->owners->removeElement($existingOwner);
      }
    }

    return $this;
  }

  /**
   * @param iterable<int, User> $owners
   */
  public function setOwners(iterable $owners): static
  {
    $uniqueOwners = [];

    foreach ($owners as $owner) {
      $ownerIdentity = $this->getOwnerIdentity($owner);
      $uniqueOwners[$ownerIdentity ?? spl_object_hash($owner)] = $owner;
    }

    foreach ($this->owners->toArray() as $existingOwner) {
      $ownerIdentity = $this->getOwnerIdentity($existingOwner);

      if (!array_key_exists($ownerIdentity ?? spl_object_hash($existingOwner), $uniqueOwners)) {
        $this->owners->removeElement($existingOwner);
      }
    }

    foreach ($uniqueOwners as $owner) {
      $this->addOwner($owner);
    }

    return $this;
  }

  private function hasOwner(User $owner): bool
  {
    $ownerIdentity = $this->getOwnerIdentity($owner);

    if ($ownerIdentity === null) {
      return $this->owners->contains($owner);
    }

    foreach ($this->owners as $existingOwner) {
      if ($this->getOwnerIdentity($existingOwner) === $ownerIdentity) {
        return true;
      }
    }

    return false;
  }

  private function getOwnerIdentity(User $owner): ?string
  {
    if ($owner->getId() !== null) {
      return 'id:' . $owner->getId();
    }

    if ($owner->getUuid() !== null) {
      return 'uuid:' . (string) $owner->getUuid();
    }

    return null;
  }

  public function getOpas(): ?Prescription
  {
    return $this->opas;
  }

  public function setOpas(?Prescription $opas): static
  {
    $this->opas = $opas;

    return $this;
  }

  /**
   * @return Collection<int, Event>
   */
  public function getEvents(): Collection
  {
    return $this->events;
  }

  public function addEvent(Event $event): static
  {
    if (!$this->events->contains($event)) {
      $this->events->add($event);
      $event->setMission($this);
    }

    return $this;
  }

  public function removeEvent(Event $event): static
  {
    if ($this->events->removeElement($event)) {
      // set the owning side to null (unless already changed)
      if ($event->getMission() === $this) {
        $event->setMission(null);
      }
    }

    return $this;
  }

  /**
   * @return Collection<int, Observation>
   */
  public function getObservations(): Collection
  {
    return $this->observations;
  }

  public function addObservation(Observation $observation): static
  {
    if (!$this->observations->contains($observation)) {
      $this->observations->add($observation);
      $observation->setMission($this);
    }

    return $this;
  }

  public function removeObservation(Observation $observation): static
  {
    if ($this->observations->removeElement($observation) && $observation->getMission() === $this) {
      $observation->setMission(null);
    }

    return $this;
  }
}
