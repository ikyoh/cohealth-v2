<?php

namespace App\EventSubscriber;

use App\Entity\User;
use Doctrine\Bundle\DoctrineBundle\Attribute\AsDoctrineListener;
use Doctrine\ORM\Event\PrePersistEventArgs;
use Doctrine\ORM\Event\PreUpdateEventArgs;
use Doctrine\ORM\Events;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

#[AsDoctrineListener(event: Events::prePersist)]
#[AsDoctrineListener(event: Events::preUpdate)]
class UserPasswordSubscriber
{
    public function __construct(
        private readonly UserPasswordHasherInterface $passwordHasher,
    ) {
    }

    public function prePersist(PrePersistEventArgs $args): void
    {
        $this->hashPassword($args->getObject());
    }

    public function preUpdate(PreUpdateEventArgs $args): void
    {
        $user = $args->getObject();

        if (!$this->hashPassword($user)) {
            return;
        }

        $entityManager = $args->getObjectManager();
        $entityManager->getUnitOfWork()->recomputeSingleEntityChangeSet(
            $entityManager->getClassMetadata(User::class),
            $user,
        );
    }

    private function hashPassword(object $object): bool
    {
        if (!$object instanceof User || !$object->getPassword()) {
            return false;
        }

        if (password_get_info($object->getPassword())['algo'] !== 0) {
            return false;
        }

        $object->setPassword($this->passwordHasher->hashPassword($object, $object->getPassword()));

        return true;
    }
}
