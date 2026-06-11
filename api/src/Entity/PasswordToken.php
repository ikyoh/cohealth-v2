<?php

declare(strict_types=1);

namespace App\Entity;

use CoopTilleuls\ForgotPasswordBundle\Entity\AbstractPasswordToken;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity]
class PasswordToken extends AbstractPasswordToken
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\ManyToOne(targetEntity: User::class)]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    private ?User $user = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getUser(): ?User
    {
        return $this->user;
    }

    public function setUser($user): self
    {
        if (!$user instanceof User) {
            throw new \InvalidArgumentException('PasswordToken expects an App\Entity\User.');
        }

        $this->user = $user;

        return $this;
    }
}
