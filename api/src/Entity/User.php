<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use App\Repository\UserRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Security\Core\User\PasswordAuthenticatedUserInterface;
use Symfony\Component\Security\Core\User\UserInterface;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\Put;
use ApiPlatform\Metadata\Patch;
use ApiPlatform\Metadata\Post;
use Doctrine\DBAL\Types\Types;
use ApiPlatform\Metadata\GetCollection;
use App\Controller\CurrentUserController;
use Symfony\Component\Serializer\Annotation\Groups;
use ApiPlatform\Metadata\ApiProperty;
use Symfony\Bridge\Doctrine\Types\UuidType;
use Symfony\Component\Uid\Uuid;
use ApiPlatform\Metadata\ApiFilter;
use App\Filter\MultipleFieldsSearchFilter;
use ApiPlatform\Doctrine\Orm\Filter\OrderFilter;
use App\Model\PrincipalCategoryEnum;
use App\State\UserProcessor;
use Symfony\Component\Validator\Constraints as Assert;
use Symfony\Component\Validator\Context\ExecutionContextInterface;

#[ORM\Entity(repositoryClass: UserRepository::class)]
#[
    ApiResource(
        mercure: true,
        normalizationContext: ['groups' => ['users:read']],
        denormalizationContext: ['groups' => ['user:write']],
        operations: [
            new GetCollection(security: "is_granted('ROLE_ADMIN')"),
            new Get(
                normalizationContext: ['groups' => ['user:read']],
                security: "is_granted('ROLE_ADMIN') or object == user or object.isCooperator()"
            ),
            new Put(
                inputFormats: ['json' => ['application/json'], 'multipart' => ['multipart/form-data']],
                security: "is_granted('ROLE_ADMIN')",
                processor: UserProcessor::class
            ),
            new Patch(
                inputFormats: [
                    'json' => ['application/json', 'application/merge-patch+json'],
                    'multipart' => ['multipart/form-data'],
                ],
                security: "is_granted('ROLE_ADMIN') or object == user",
                securityPostDenormalize: "is_granted('ROLE_ADMIN') or (object == user and object.getRoles() == previous_object.getRoles() and object.getIsActive() == previous_object.getIsActive() and object.getIsApproved() == previous_object.getIsApproved() and object.getIsOptin() == previous_object.getIsOptin())",
                processor: UserProcessor::class
            ),
            new Post(
                inputFormats: ['json' => ['application/json'], 'multipart' => ['multipart/form-data']],
                security: "is_granted('ROLE_ADMIN')",
                processor: UserProcessor::class
            ),
            new Get(
                name: 'currentUser',
                uriTemplate: '/current_user',
                paginationEnabled: false,
                controller: CurrentUserController::class,
                read: false,
            ),
        ]
    )
]
#[ApiFilter(MultipleFieldsSearchFilter::class, properties: ["id", "firstname", "lastname", "email", "organizationName", "rcc", "gln"])]
#[ApiFilter(OrderFilter::class, properties: ['id', 'firstname', 'lastname', 'email', 'organizationName', 'isActive', 'isApproved', 'createdAt'])]
#[ORM\Table(name: '`user`')]
#[ORM\UniqueConstraint(name: 'UNIQ_IDENTIFIER_EMAIL', fields: ['email'])]
class User implements UserInterface, PasswordAuthenticatedUserInterface
{
    private const IDENTIFIER_EXEMPT_ROLES = [
        'ROLE_ADMIN',
        'ROLE_COORDINATOR',
        'ROLE_COORNINATOR',
    ];

    #[ORM\Id]
    #[ApiProperty(identifier: false)]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(["users:read", "user:read"])]
    private ?int $id = null;

    #[ApiProperty(identifier: true)]
    #[ORM\Column(type: UuidType::NAME, unique: true)]
    #[ORM\CustomIdGenerator(class: 'doctrine.uuid_generator')]
    #[Groups(["users:read", "user:read"])]
    private Uuid $uuid;

    #[ORM\Column(length: 180)]
    #[Groups(["user:write", "users:read", "user:read"])]
    private ?string $email = null;

    /**
     * @var list<string> The user roles
     */
    #[ORM\Column]
    #[Groups(["user:write", "users:read", "user:read"])]
    private array $roles = [];

    /**
     * @var string The hashed password
     */
    #[ORM\Column]
    #[Groups(["user:write"])]
    private ?string $password = null;

    #[ORM\Column(length: 255)]
    #[Groups(["user:write", "users:read", "user:read"])]
    private ?string $firstname = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(["user:write", "users:read", "user:read"])]
    private ?string $lastname = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(["user:write", "users:read", "user:read"])]
    private ?string $organizationName = null;

    #[ORM\Column]
    #[Groups(["user:write", "users:read", "user:read"])]
    private ?bool $isActive = null;

    #[ORM\Column]
    #[Groups(["user:write", "users:read", "user:read"])]
    private ?\DateTimeImmutable $createdAt = null;

    #[ORM\Column]
    #[Groups(["user:write", "users:read", "user:read"])]
    private ?bool $isOptin = null;

    #[ORM\Column]
    #[Groups(["user:write", "users:read", "user:read"])]
    private ?bool $isApproved = null;

    #[ORM\Column]
    #[Groups(["user:write", "users:read", "user:read"])]
    private bool $onboardingCompleted = false;

    /**
     * @var Collection<int, Mission>
     */
    #[ORM\OneToMany(targetEntity: Mission::class, mappedBy: 'owner', orphanRemoval: true)]
    private Collection $missions;

    /**
     * @var Collection<int, Mission>
     */
    #[ORM\ManyToMany(targetEntity: Mission::class, mappedBy: 'owners')]
    private Collection $sharedMissions;

    /**
     * @var Collection<int, Patient>
     */
    #[ORM\OneToMany(targetEntity: Patient::class, mappedBy: 'owner', orphanRemoval: true)]
    private Collection $patients;

    /**
     * @var Collection<int, Prescription>
     */
    #[ORM\OneToMany(targetEntity: Prescription::class, mappedBy: 'owner', orphanRemoval: true)]
    private Collection $prescriptions;

    /**
     * @var Collection<int, Event>
     */
    #[ORM\OneToMany(targetEntity: Event::class, mappedBy: 'owner', orphanRemoval: true)]
    private Collection $events;

    /**
     * @var Collection<int, Observation>
     */
    #[ORM\OneToMany(targetEntity: Observation::class, mappedBy: 'owner', orphanRemoval: true)]
    private Collection $observations;

    #[ORM\OneToOne(targetEntity: MediaAvatar::class)]
    #[Groups(["user:write", "users:read", "user:read"])]
    private ?MediaAvatar $avatar = null;

    #[ORM\OneToOne(targetEntity: MediaSignature::class)]
    #[Groups(["user:write", "users:read", "user:read", "principal:read"])]
    private ?MediaSignature $signature = null;

    #[ORM\Column(length: 7, nullable: true, unique: true)]
    #[Groups(["user:write", "users:read", "user:read"])]
    #[Assert\Regex(
        pattern: '/^[a-zA-Z]\d{6}$/',
        message: 'Le RCC doit contenir une lettre suivie de 6 chiffres.',
    )]
    private ?string $rcc = null;

    #[ORM\Column(length: 13, nullable: true)]
    #[Groups(["user:write", "users:read", "user:read"])]
    #[Assert\Regex(
        pattern: '/^\d{13}$/',
        message: 'Le GLN doit contenir 13 chiffres.',
    )]
    private ?string $gln = null;

    #[ORM\Column(length: 12, nullable: true)]
    #[Groups(["user:write", "users:read", "user:read"])]
    private ?string $mobile = null;

    #[ORM\Column(length: 12, nullable: true)]
    #[Groups(["user:write", "users:read", "user:read"])]
    private ?string $phone = null;

    #[ORM\Column(length: 12, nullable: true)]
    #[Groups(["user:write", "users:read", "user:read"])]
    private ?string $fax = null;

    #[ORM\Column(length: 255)]
    #[Groups(["user:write", "users:read", "user:read"])]
    private ?string $address = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(["user:write", "users:read", "user:read"])]
    private ?string $postCode = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(["user:write", "users:read", "user:read"])]
    private ?string $city = null;

    #[ORM\Column(length: 255)]
    #[Groups(["user:write", "users:read", "user:read"])]
    private ?string $country = null;

    #[ORM\OneToOne(targetEntity: Principal::class, inversedBy: 'user', cascade: ['persist'])]
    #[ORM\JoinColumn(nullable: true, onDelete: 'SET NULL')]
    #[Groups(["users:read", "user:read"])]
    private ?Principal $principal = null;

    #[Groups(["user:write"])]
    private ?PrincipalCategoryEnum $principalCategory = null;

    #[Groups(["user:write"])]
    private ?string $principalCanton = null;


    public function __construct()
    {
        $this->uuid = Uuid::v7();
        $this->createdAt = new \DateTimeImmutable();
        $this->missions = new ArrayCollection();
        $this->sharedMissions = new ArrayCollection();
        $this->patients = new ArrayCollection();
        $this->prescriptions = new ArrayCollection();
        $this->events = new ArrayCollection();
        $this->observations = new ArrayCollection();
    }


    public function getUsername(): string
    {
        return (string) $this->email;
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getUuid(): ?Uuid
    {
        return $this->uuid;
    }

    public function getEmail(): ?string
    {
        return $this->email;
    }

    public function setEmail(string $email): static
    {
        $this->email = $email;

        return $this;
    }

    /**
     * A visual identifier that represents this user.
     *
     * @see UserInterface
     */
    public function getUserIdentifier(): string
    {
        return (string) $this->email;
    }

    /**
     * @see UserInterface
     *
     * @return list<string>
     */
    public function getRoles(): array
    {
        $roles = $this->roles;
        // guarantee every user at least has ROLE_USER
        $roles[] = 'ROLE_USER';

        return array_unique($roles);
    }

    /**
     * @param list<string> $roles
     */
    public function setRoles(array $roles): static
    {
        $this->roles = $roles;

        return $this;
    }

    public function isCooperator(): bool
    {
        if (array_intersect(self::IDENTIFIER_EXEMPT_ROLES, $this->roles) !== []) {
            return false;
        }

        return in_array('ROLE_NURSE', $this->roles, true)
            || in_array('ROLE_PHYSIO', $this->roles, true);
    }

    #[Assert\Callback]
    public function validateProfessionalIdentifiers(ExecutionContextInterface $context): void
    {
        if (array_intersect(self::IDENTIFIER_EXEMPT_ROLES, $this->roles) !== []) {
            return;
        }

        if (trim((string) $this->rcc) === '') {
            $context->buildViolation('Le RCC est obligatoire pour ce rôle.')
                ->atPath('rcc')
                ->addViolation();
        }

        if (trim((string) $this->gln) === '') {
            $context->buildViolation('Le GLN est obligatoire pour ce rôle.')
                ->atPath('gln')
                ->addViolation();
        }
    }

    /**
     * @see PasswordAuthenticatedUserInterface
     */
    public function getPassword(): ?string
    {
        return $this->password;
    }

    public function setPassword(string $password): static
    {
        $this->password = $password;

        return $this;
    }

    /**
     * @see UserInterface
     */
    public function eraseCredentials(): void
    {
        // If you store any temporary, sensitive data on the user, clear it here
        // $this->plainPassword = null;
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

    public function setLastname(?string $lastname): static
    {
        $this->lastname = $lastname;

        return $this;
    }

    public function getOrganizationName(): ?string
    {
        return $this->organizationName;
    }

    public function setOrganizationName(?string $organizationName): static
    {
        $this->organizationName = $organizationName;

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

    public function getCreatedAt(): ?\DateTimeImmutable
    {
        return $this->createdAt;
    }

    public function setCreatedAt(\DateTimeImmutable $createdAt): static
    {
        $this->createdAt = $createdAt;

        return $this;
    }

    public function getIsOptin(): ?bool
    {
        return $this->isOptin;
    }

    public function setIsOptin(bool $isOptin): static
    {
        $this->isOptin = $isOptin;

        return $this;
    }

    public function getIsApproved(): ?bool
    {
        return $this->isApproved;
    }

    public function setIsApproved(bool $isApproved): static
    {
        $this->isApproved = $isApproved;

        return $this;
    }

    public function isOnboardingCompleted(): bool
    {
        return $this->onboardingCompleted;
    }

    public function setOnboardingCompleted(bool $onboardingCompleted): static
    {
        $this->onboardingCompleted = $onboardingCompleted;

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
            $mission->setOwner($this);
        }

        return $this;
    }

    public function removeMission(Mission $mission): static
    {
        if ($this->missions->removeElement($mission)) {
            // set the owning side to null (unless already changed)
            if ($mission->getOwner() === $this) {
                $mission->setOwner(null);
            }
        }

        return $this;
    }

    /**
     * @return Collection<int, Mission>
     */
    public function getSharedMissions(): Collection
    {
        return $this->sharedMissions;
    }

    public function addSharedMission(Mission $sharedMission): static
    {
        if (!$this->sharedMissions->contains($sharedMission)) {
            $this->sharedMissions->add($sharedMission);
            $sharedMission->addOwner($this);
        }

        return $this;
    }

    public function removeSharedMission(Mission $sharedMission): static
    {
        if ($this->sharedMissions->removeElement($sharedMission)) {
            $sharedMission->removeOwner($this);
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
            $patient->setOwner($this);
        }

        return $this;
    }

    public function removePatient(Patient $patient): static
    {
        if ($this->patients->removeElement($patient)) {
            // set the owning side to null (unless already changed)
            if ($patient->getOwner() === $this) {
                $patient->setOwner(null);
            }
        }

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
            $prescription->setOwner($this);
        }

        return $this;
    }

    public function removePrescription(Prescription $prescription): static
    {
        if ($this->prescriptions->removeElement($prescription)) {
            // set the owning side to null (unless already changed)
            if ($prescription->getOwner() === $this) {
                $prescription->setOwner(null);
            }
        }

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
            $event->setOwner($this);
        }

        return $this;
    }

    public function removeEvent(Event $event): static
    {
        if ($this->events->removeElement($event)) {
            // set the owning side to null (unless already changed)
            if ($event->getOwner() === $this) {
                $event->setOwner(null);
            }
        }

        return $this;
    }

    public function getAvatar(): ?MediaAvatar
    {
        return $this->avatar;
    }

    public function setAvatar(?MediaAvatar $avatar): static
    {
        $this->avatar = $avatar;

        return $this;
    }

    public function getSignature(): ?MediaSignature
    {
        return $this->signature;
    }

    public function setSignature(?MediaSignature $signature): static
    {
        $this->signature = $signature;

        return $this;
    }

    public function getRcc(): ?string
    {
        return $this->rcc;
    }

    public function setRcc(?string $rcc): static
    {
        $this->rcc = $rcc;

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

    public function getMobile(): ?string
    {
        return $this->mobile;
    }

    public function setMobile(?string $mobile): static
    {
        $this->mobile = $mobile;

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

    public function getAddress(): ?string
    {
        return $this->address;
    }

    public function setAddress(string $address): static
    {
        $this->address = $address;

        return $this;
    }

    public function getPostCode(): ?string
    {
        return $this->postCode;
    }

    public function setPostCode(?string $postCode): static
    {
        $this->postCode = $postCode;

        return $this;
    }

    public function getCity(): ?string
    {
        return $this->city;
    }

    public function setCity(?string $city): static
    {
        $this->city = $city;

        return $this;
    }

    public function getCountry(): ?string
    {
        return $this->country;
    }

    public function setCountry(string $country): static
    {
        $this->country = $country;

        return $this;
    }

    public function getPrincipal(): ?Principal
    {
        return $this->principal;
    }

    public function setPrincipal(?Principal $principal): static
    {
        if ($this->principal === $principal) {
            return $this;
        }

        $previousPrincipal = $this->principal;
        $this->principal = $principal;

        if ($previousPrincipal?->getUser() === $this) {
            $previousPrincipal->setUser(null);
        }

        if ($principal !== null && $principal->getUser() !== $this) {
            $principal->setUser($this);
        }

        return $this;
    }

    public function getPrincipalCategory(): ?PrincipalCategoryEnum
    {
        return $this->principalCategory;
    }

    public function setPrincipalCategory(?PrincipalCategoryEnum $principalCategory): static
    {
        $this->principalCategory = $principalCategory;

        return $this;
    }

    public function getPrincipalCanton(): ?string
    {
        return $this->principalCanton;
    }

    public function setPrincipalCanton(?string $principalCanton): static
    {
        $this->principalCanton = $principalCanton;

        return $this;
    }
}
