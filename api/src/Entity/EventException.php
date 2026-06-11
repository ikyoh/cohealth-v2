<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\ApiProperty;
use App\Repository\EventExceptionRepository;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Uid\Uuid;
use Symfony\Bridge\Doctrine\Types\UuidType;

#[ORM\Entity(repositoryClass: EventExceptionRepository::class)]
#[ApiResource]
class EventException
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

    #[ORM\Column]
    private ?\DateTime $originalDate = null;

    #[ORM\Column]
    private ?bool $isCancelled = null;

    #[ORM\Column(nullable: true)]
    private ?\DateTime $rescheduledDate = null;

    #[ORM\Column(nullable: true)]
    private ?\DateTime $rescheduledEnd = null;

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

    public function getOriginalDate(): ?\DateTime
    {
        return $this->originalDate;
    }

    public function setOriginalDate(\DateTime $originalDate): static
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

    public function getRescheduledDate(): ?\DateTime
    {
        return $this->rescheduledDate;
    }

    public function setRescheduledDate(?\DateTime $rescheduledDate): static
    {
        $this->rescheduledDate = $rescheduledDate;

        return $this;
    }

    public function getRescheduledEnd(): ?\DateTime
    {
        return $this->rescheduledEnd;
    }

    public function setRescheduledEnd(?\DateTime $rescheduledEnd): static
    {
        $this->rescheduledEnd = $rescheduledEnd;

        return $this;
    }
}
