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
use ApiPlatform\Metadata\Post;
use App\Repository\MissionDocumentRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Bridge\Doctrine\Types\UuidType;
use Symfony\Component\HttpFoundation\File\File;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Uid\Uuid;
use Symfony\Component\Validator\Constraints as Assert;
use Vich\UploaderBundle\Mapping\Attribute\Uploadable;
use Vich\UploaderBundle\Mapping\Attribute\UploadableField;

#[Uploadable]
#[ORM\Entity(repositoryClass: MissionDocumentRepository::class)]
#[ApiResource(
    normalizationContext: ['groups' => ['mission_document:read']],
    denormalizationContext: ['groups' => ['mission_document:write']],
    operations: [
        new Get(
            security: "is_granted('MISSION_VIEW', object.getMission())",
        ),
        new GetCollection(
            security: "is_granted('ROLE_USER')",
        ),
        new Post(
            inputFormats: ['multipart' => ['multipart/form-data']],
            validationContext: ['groups' => ['Default', 'mission_document:create']],
            securityPostDenormalize: "object.getMission() and is_granted('MISSION_EDIT', object.getMission())",
        ),
        new Patch(
            inputFormats: [
                'json' => ['application/merge-patch+json'],
                'multipart' => ['multipart/form-data'],
            ],
            security: "is_granted('MISSION_EDIT', object.getMission())",
            securityPostDenormalize: "object.getMission() and is_granted('MISSION_EDIT', object.getMission())",
        ),
        new Delete(
            security: "is_granted('MISSION_EDIT', object.getMission())",
        ),
    ],
)]
#[ApiFilter(SearchFilter::class, properties: ['mission' => 'exact'])]
class MissionDocument
{
    #[ORM\Id]
    #[ApiProperty(identifier: false)]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ApiProperty(identifier: true)]
    #[ORM\Column(type: UuidType::NAME, unique: true)]
    #[ORM\CustomIdGenerator(class: 'doctrine.uuid_generator')]
    #[Groups(['mission_document:read'])]
    private Uuid $uuid;

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    #[Groups(['mission_document:read', 'mission_document:write'])]
    private ?Mission $mission = null;

    #[ORM\Column(length: 255)]
    #[Groups(['mission_document:read', 'mission_document:write'])]
    #[Assert\NotBlank]
    #[Assert\Length(max: 255)]
    private ?string $title = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    #[Groups(['mission_document:read', 'mission_document:write'])]
    private ?string $description = null;

    #[UploadableField(mapping: 'media_document', fileNameProperty: 'filePath')]
    #[Groups(['mission_document:write'])]
    #[Assert\NotNull(groups: ['mission_document:create'])]
    #[Assert\File(
        maxSize: '15M',
        mimeTypes: [
            'application/pdf',
            'image/jpeg',
            'image/png',
            'image/webp',
            'text/plain',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ],
        mimeTypesMessage: 'Ce type de fichier n’est pas autorisé.',
    )]
    private ?File $file = null;

    #[ORM\Column(length: 255)]
    private ?string $filePath = null;

    #[ORM\Column(length: 255)]
    #[Groups(['mission_document:read'])]
    private ?string $originalName = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(['mission_document:read'])]
    private ?string $mimeType = null;

    #[ORM\Column(nullable: true)]
    #[Groups(['mission_document:read'])]
    private ?int $fileSize = null;

    #[ORM\Column]
    #[Groups(['mission_document:read'])]
    private \DateTimeImmutable $createdAt;

    #[ORM\Column]
    #[Groups(['mission_document:read'])]
    private \DateTimeImmutable $updatedAt;

    public function __construct()
    {
        $this->uuid = Uuid::v7();
        $this->createdAt = new \DateTimeImmutable();
        $this->updatedAt = new \DateTimeImmutable();
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

    public function getTitle(): ?string
    {
        return $this->title;
    }

    public function setTitle(string $title): static
    {
        $this->title = trim($title);
        $this->updatedAt = new \DateTimeImmutable();

        return $this;
    }

    public function getDescription(): ?string
    {
        return $this->description;
    }

    public function setDescription(?string $description): static
    {
        $description = trim((string) $description);
        $this->description = $description === '' ? null : $description;
        $this->updatedAt = new \DateTimeImmutable();

        return $this;
    }

    public function getFile(): ?File
    {
        return $this->file;
    }

    public function setFile(?File $file): static
    {
        $this->file = $file;

        if ($file !== null) {
            if ($file instanceof UploadedFile) {
                $this->originalName = $file->getClientOriginalName();
            } elseif ($this->originalName === null) {
                $this->originalName = $file->getFilename();
            }
            $this->mimeType = $file->getMimeType();
            $this->fileSize = $file->getSize() ?: null;
            $this->updatedAt = new \DateTimeImmutable();
        }

        return $this;
    }

    public function getFilePath(): ?string
    {
        return $this->filePath;
    }

    public function setFilePath(?string $filePath): static
    {
        $this->filePath = $filePath;

        return $this;
    }

    public function getOriginalName(): ?string
    {
        return $this->originalName;
    }

    public function getMimeType(): ?string
    {
        return $this->mimeType;
    }

    public function getFileSize(): ?int
    {
        return $this->fileSize;
    }

    public function getCreatedAt(): \DateTimeImmutable
    {
        return $this->createdAt;
    }

    public function getUpdatedAt(): \DateTimeImmutable
    {
        return $this->updatedAt;
    }

    #[Groups(['mission_document:read'])]
    public function getContentUrl(): string
    {
        return '/mission_documents/' . $this->uuid . '/download';
    }
}
