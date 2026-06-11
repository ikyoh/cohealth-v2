<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\ApiProperty;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Put;
use ApiPlatform\Metadata\Post;
use Doctrine\DBAL\Types\Types;
use ApiPlatform\Metadata\Patch;
use ApiPlatform\Metadata\Delete;
use App\Repository\EventRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Bridge\Doctrine\Types\UuidType;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Uid\Uuid;
use Symfony\Component\Validator\Constraints as Assert;
use Symfony\Component\Validator\Context\ExecutionContextInterface;
use App\Entity\UserOwnedInterface;
use ApiPlatform\Metadata\ApiFilter;
use ApiPlatform\Doctrine\Orm\Filter\DateFilter;
use ApiPlatform\Doctrine\Orm\Filter\SearchFilter;
use App\Filter\EventDateFilter;
use App\State\EventProcessor;
use RRule\RRule;

#[ORM\Entity(repositoryClass: EventRepository::class)]
#[
    ApiResource(
        mercure: true,
        normalizationContext: ['groups' => ['events:read']],
        denormalizationContext: ['groups' => ['event:write']],
        operations: [
            new Get(
                normalizationContext: ['groups' => ['event:read']],
                security: "object.getMission() ? is_granted('MISSION_VIEW', object.getMission()) : object.getOwner() == user"
            ),
            new Put(
                security: "object.getMission() ? is_granted('MISSION_EDIT', object.getMission()) : object.getOwner() == user",
                processor: EventProcessor::class
            ),
            new Patch(
                security: "object.getMission() ? is_granted('MISSION_EDIT', object.getMission()) : object.getOwner() == user",
                processor: EventProcessor::class
            ),
            new Delete(
                security: "object.getMission() ? is_granted('MISSION_EDIT', object.getMission()) : object.getOwner() == user"
            ),
            new GetCollection(security: "is_granted('ROLE_USER')"),
            new Post(
                securityPostDenormalize: "object.getMission() ? is_granted('MISSION_EDIT', object.getMission()) : object.getOwner() == user",
                processor: EventProcessor::class
            ),
        ]
    )
]
#[ApiFilter(DateFilter::class, properties: ['beginDate', 'endDate'])]
#[ApiFilter(EventDateFilter::class)]
#[ApiFilter(SearchFilter::class, properties: ['mission'])]
class Event implements UserOwnedInterface
{
    #[ORM\Id]
    #[ApiProperty(identifier: false)]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(["event:write", "events:read", "event:read"])]
    private ?int $id = null;

    #[ApiProperty(identifier: true)]
    #[ORM\Column(type: UuidType::NAME, unique: true)]
    #[ORM\CustomIdGenerator(class: 'doctrine.uuid_generator')]
    #[Groups(["event:write", "events:read", "event:read"])]
    private Uuid $uuid;

    #[ORM\Column]
    #[Groups(["event:write", "events:read", "event:read"])]
    private ?bool $isAllday = false;


    #[ORM\Column(type: Types::DATETIME_MUTABLE)]
    #[Groups(["event:write", "events:read", "event:read"])]
    private ?\DateTimeInterface $beginDate = null;

    #[ORM\Column(type: Types::DATETIME_MUTABLE)]
    #[Groups(["event:write", "events:read", "event:read"])]
    private ?\DateTimeInterface $endDate = null;

    #[ORM\Column(length: 255)]
    #[Groups(["event:write", "events:read", "event:read"])]
    private ?string $title = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(["event:write", "events:read", "event:read"])]
    private ?string $description = null;

    #[ORM\ManyToOne(inversedBy: 'events')]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(["events:read", "event:read"])]
    private ?User $owner = null;

    #[ORM\ManyToOne(inversedBy: 'events')]
    #[Groups(["event:write", "events:read", "event:read"])]
    private ?Mission $mission = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(["event:write", "events:read", "event:read"])]
    private ?string $recurrenceRule = null;

    #[ORM\Column(nullable: true)]
    #[Groups(["event:write", "events:read", "event:read"])]
    private ?array $services = null;

    /**
     * @var Collection<int, User>
     */
    #[ORM\ManyToMany(targetEntity: User::class)]
    #[ORM\JoinTable(name: 'event_cooperator')]
    #[Groups(["events:read", "event:read"])]
    private Collection $cooperators;

    public function __construct()
    {
        $this->uuid = Uuid::v7();
        $this->cooperators = new ArrayCollection();
    }

    #[Groups(["events:read", "event:read"])]
    public function getRecurrentEvents(): ?string
    {

        if (!$this->recurrenceRule) {
            return null;
        }

        // Guard: recurrenceRule must be a string
        if (!is_string($this->recurrenceRule)) {
            return null;
        }

        // Guard: beginDate and endDate must be set
        if (!$this->beginDate || !$this->endDate) {
            return null;
        }

        $rrule = new RRule($this->recurrenceRule);

        $occurrences = $rrule->getOccurrencesBetween($this->beginDate->format('Ymd\THis'), $this->endDate->format('Ymd\THis'));

        return json_encode($occurrences);
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getUuid(): ?Uuid
    {
        return $this->uuid;
    }

    public function isAllday(): ?bool
    {
        return $this->isAllday;
    }

    public function setIsAllday(bool $isAllday): static
    {
        $this->isAllday = $isAllday;

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

    public function getTitle(): ?string
    {
        return $this->title;
    }

    public function setTitle(string $title): static
    {
        $this->title = $title;

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

    public function getOwner(): ?User
    {
        return $this->owner;
    }

    public function setOwner(?User $owner): static
    {
        $this->owner = $owner;

        return $this;
    }

    public function getMission(): ?Mission
    {
        return $this->mission;
    }

    #[Groups(["events:read", "event:read"])]
    public function getPatientFullName(): ?string
    {
        $patient = $this->mission?->getPatient();

        if (!$patient) {
            return null;
        }

        return trim(sprintf('%s %s', $patient->getLastname(), $patient->getFirstname()));
    }

    #[Groups(["events:read", "event:read"])]
    public function getPatientUuid(): ?string
    {
        return $this->mission?->getPatient()?->getUuid()?->toRfc4122();
    }

    public function setMission(?Mission $mission): static
    {
        $this->mission = $mission;

        return $this;
    }

    public function getRecurrenceRule(): ?string
    {
        return $this->recurrenceRule;
    }

    public function setRecurrenceRule(?string $recurrenceRule): static
    {
        $this->recurrenceRule = $recurrenceRule;

        return $this;
    }

    public function getServices(): ?array
    {
        return $this->services;
    }

    public function setServices(?array $services): static
    {
        $this->services = $services;

        return $this;
    }

    /**
     * @return Collection<int, User>
     */
    public function getCooperators(): Collection
    {
        return $this->cooperators;
    }

    public function addCooperator(User $cooperator): static
    {
        if (!$this->cooperators->contains($cooperator)) {
            $this->cooperators->add($cooperator);
        }

        return $this;
    }

    public function removeCooperator(User $cooperator): static
    {
        $this->cooperators->removeElement($cooperator);

        return $this;
    }

    /**
     * @param iterable<int, User> $cooperators
     */
    public function setCooperators(iterable $cooperators): static
    {
        $this->cooperators->clear();

        foreach ($cooperators as $cooperator) {
            $this->addCooperator($cooperator);
        }

        return $this;
    }

    #[Assert\Callback]
    public function validateServiceCooperators(ExecutionContextInterface $context): void
    {
        if ($this->mission === null || $this->services === null) {
            return;
        }

        $allowedCooperatorIris = [];

        foreach ($this->mission->getOwners() as $owner) {
            if ($owner->getUuid() !== null) {
                $allowedCooperatorIris[] = '/users/' . $owner->getUuid();
            }
        }

        foreach ($this->services as $index => $service) {
            $cooperator = is_array($service) ? ($service['cooperator'] ?? null) : null;
            $cooperatorIri = is_array($cooperator) ? ($cooperator['@id'] ?? null) : null;

            if ($cooperatorIri !== null && !in_array($cooperatorIri, $allowedCooperatorIris, true)) {
                $context
                    ->buildViolation('Le collaborateur doit être associé à la mission.')
                    ->atPath(sprintf('services[%s].cooperator', $index))
                    ->addViolation();
            }
        }
    }
}
