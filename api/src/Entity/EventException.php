<?php

namespace App\Entity;

use App\Repository\EventExceptionRepository;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Uid\Uuid;
use Symfony\Bridge\Doctrine\Types\UuidType;

#[ORM\Entity(repositoryClass: EventExceptionRepository::class)]
#[ORM\UniqueConstraint(name: 'uniq_event_exception_occurrence', columns: ['event_id', 'original_date'])]
class EventException
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(type: UuidType::NAME, unique: true)]
    #[ORM\CustomIdGenerator(class: 'doctrine.uuid_generator')]
    private Uuid $uuid;

    #[ORM\ManyToOne(inversedBy: 'exceptions')]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    private ?Event $event = null;

    #[ORM\Column(type: 'datetime_immutable')]
    private ?\DateTimeImmutable $originalDate = null;

    #[ORM\Column]
    private bool $isCancelled = false;

    #[ORM\Column(type: 'datetime_immutable', nullable: true)]
    private ?\DateTimeImmutable $rescheduledDate = null;

    #[ORM\Column(type: 'datetime_immutable', nullable: true)]
    private ?\DateTimeImmutable $rescheduledEnd = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $title = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $description = null;

    #[ORM\Column(nullable: true)]
    private ?bool $isAllday = null;

    #[ORM\Column(nullable: true)]
    private ?array $services = null;

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

    public function getEvent(): ?Event
    {
        return $this->event;
    }

    public function setEvent(?Event $event): static
    {
        $this->event = $event;

        return $this;
    }

    public function getOriginalDate(): ?\DateTimeImmutable
    {
        return $this->originalDate;
    }

    public function setOriginalDate(\DateTimeImmutable $originalDate): static
    {
        $this->originalDate = $originalDate;

        return $this;
    }

    public function isCancelled(): ?bool
    {
        return $this->isCancelled;
    }

    public function setIsCancelled(bool $isCancelled): static
    {
        $this->isCancelled = $isCancelled;

        return $this;
    }

    public function getRescheduledDate(): ?\DateTimeImmutable
    {
        return $this->rescheduledDate;
    }

    public function setRescheduledDate(?\DateTimeImmutable $rescheduledDate): static
    {
        $this->rescheduledDate = $rescheduledDate;

        return $this;
    }

    public function getRescheduledEnd(): ?\DateTimeImmutable
    {
        return $this->rescheduledEnd;
    }

    public function setRescheduledEnd(?\DateTimeImmutable $rescheduledEnd): static
    {
        $this->rescheduledEnd = $rescheduledEnd;

        return $this;
    }

    public function getTitle(): ?string
    {
        return $this->title;
    }

    public function setTitle(?string $title): static
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

    public function getIsAllday(): ?bool
    {
        return $this->isAllday;
    }

    public function setIsAllday(?bool $isAllday): static
    {
        $this->isAllday = $isAllday;

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
}
