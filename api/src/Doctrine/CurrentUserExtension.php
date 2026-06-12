<?php
// api/src/Doctrine/CurrentUserExtension.php

namespace App\Doctrine;

use App\Entity\Mission;
use App\Entity\Patient;
use App\Entity\Event;
use App\Entity\Prescription;
use App\Entity\Observation;
use App\Entity\MissionDocument;
use ApiPlatform\Doctrine\Orm\Extension\QueryCollectionExtensionInterface;
use ApiPlatform\Doctrine\Orm\Extension\QueryItemExtensionInterface;
use ApiPlatform\Doctrine\Orm\Util\QueryNameGeneratorInterface;
use ApiPlatform\Metadata\Operation;
use Doctrine\ORM\QueryBuilder;
use Symfony\Bundle\SecurityBundle\Security;
use App\Entity\User;
use Symfony\Component\HttpFoundation\RequestStack;

final class CurrentUserExtension implements QueryCollectionExtensionInterface, QueryItemExtensionInterface
{
  public function __construct(
    private readonly Security $security,
    private readonly RequestStack $requestStack,
  ) {
  }

  public function applyToCollection(
    QueryBuilder $queryBuilder,
    QueryNameGeneratorInterface $queryNameGenerator,
    string $resourceClass,
    ?Operation $operation = null,
    array $context = []
  ): void {
    $this->addWhere($queryBuilder, $resourceClass, true);
  }

  public function applyToItem(
    QueryBuilder $queryBuilder,
    QueryNameGeneratorInterface $queryNameGenerator,
    string $resourceClass,
    array $identifiers,
    ?Operation $operation = null,
    array $context = []
  ): void {
    $this->addWhere($queryBuilder, $resourceClass, false);
  }

  private function addWhere(QueryBuilder $queryBuilder, string $resourceClass, bool $isCollection): void
  {
    if (!in_array($resourceClass, [Mission::class, Patient::class, Event::class, Prescription::class, Observation::class, MissionDocument::class], true)) {
      return;
    }

    /** @var User|null $user */
    $user = $this->security->getUser();

    if (!$user instanceof User || $user->getUuid() === null) {
      $queryBuilder->andWhere('1 = 0');
      return;
    }

    $alias = $queryBuilder->getRootAliases()[0];

    if ($resourceClass === Patient::class) {
      $queryBuilder
        ->leftJoin($alias . '.owner', 'patientAclOwner')
        ->leftJoin($alias . '.missions', 'patientAclMission')
        ->leftJoin('patientAclMission.owner', 'patientAclMissionOwner')
        ->andWhere(
          'patientAclOwner.uuid = :currentUserUuid'
          . ' OR patientAclMissionOwner.uuid = :currentUserUuid'
          . ' OR :currentUser MEMBER OF patientAclMission.owners'
        )
        ->setParameter('currentUserUuid', $user->getUuid()?->toRfc4122())
        ->setParameter('currentUser', $user);

      return;
    }

    if ($resourceClass === Mission::class) {
      $queryBuilder
        ->innerJoin($alias . '.owner', 'missionAclOwner')
        ->andWhere('missionAclOwner.uuid = :currentUserUuid OR :currentUser MEMBER OF ' . $alias . '.owners')
        ->setParameter('currentUserUuid', $user->getUuid()?->toRfc4122())
        ->setParameter('currentUser', $user);

      return;
    }

    if ($resourceClass === MissionDocument::class) {
      $queryBuilder
        ->innerJoin($alias . '.mission', 'documentAclMission')
        ->innerJoin('documentAclMission.owner', 'documentAclMissionOwner')
        ->andWhere(
          'documentAclMissionOwner.uuid = :currentUserUuid'
          . ' OR :currentUser MEMBER OF documentAclMission.owners'
        )
        ->setParameter('currentUserUuid', $user->getUuid()?->toRfc4122())
        ->setParameter('currentUser', $user);

      return;
    }

    if (
      $resourceClass === Event::class
      && $isCollection
      && !$this->requestStack->getCurrentRequest()?->query->has('mission')
    ) {
      $queryBuilder
        ->leftJoin($alias . '.owner', 'eventGeneralOwner')
        ->andWhere('eventGeneralOwner.uuid = :currentUserUuid OR :currentUser MEMBER OF ' . $alias . '.cooperators')
        ->setParameter('currentUserUuid', $user->getUuid()?->toRfc4122())
        ->setParameter('currentUser', $user);

      return;
    }

    $relationPrefix = match ($resourceClass) {
      Event::class => 'eventAcl',
      Observation::class => 'observationAcl',
      default => 'prescriptionAcl',
    };

    $queryBuilder
      ->leftJoin($alias . '.owner', $relationPrefix . 'Owner')
      ->leftJoin($alias . '.mission', $relationPrefix . 'Mission')
      ->leftJoin($relationPrefix . 'Mission.owner', $relationPrefix . 'MissionOwner')
      ->andWhere(
        $relationPrefix . 'Owner.uuid = :currentUserUuid'
        . ' OR ' . $relationPrefix . 'MissionOwner.uuid = :currentUserUuid'
        . ' OR :currentUser MEMBER OF ' . $relationPrefix . 'Mission.owners'
      )
      ->setParameter('currentUserUuid', $user->getUuid()?->toRfc4122())
      ->setParameter('currentUser', $user);
  }
}
