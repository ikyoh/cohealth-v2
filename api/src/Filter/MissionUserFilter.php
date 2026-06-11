<?php

namespace App\Filter;

use ApiPlatform\Doctrine\Orm\Filter\AbstractFilter;
use ApiPlatform\Doctrine\Orm\Util\QueryNameGeneratorInterface;
use ApiPlatform\Metadata\Operation;
use App\Entity\User;
use Doctrine\ORM\QueryBuilder;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Contracts\Service\Attribute\Required;

class MissionUserFilter extends AbstractFilter
{
    private Security $security;

    #[Required]
    public function setSecurity(Security $security): void
    {
        $this->security = $security;
    }

    protected function filterProperty(
        string $property,
        $value,
        QueryBuilder $queryBuilder,
        QueryNameGeneratorInterface $queryNameGenerator,
        string $resourceClass,
        ?Operation $operation = null,
        array $context = []
    ): void {
        if ($property !== 'userOwnership') {
            return;
        }

        /** @var User|null $user */
        $user = $this->security->getUser();

        if (!$user instanceof User) {
            return;
        }

        $ownership = $value === 'not-owned' ? 'not-owned' : 'owned';
        $alias = $queryBuilder->getRootAliases()[0];

        if ($ownership === 'not-owned') {
            $queryBuilder
                ->andWhere($alias . '.owner != :missionFilterUser')
                ->andWhere(':missionFilterUser MEMBER OF ' . $alias . '.owners')
                ->setParameter('missionFilterUser', $user);

            return;
        }

        $queryBuilder
            ->andWhere($alias . '.owner = :missionFilterUser')
            ->setParameter('missionFilterUser', $user);
    }

    public function getDescription(string $resourceClass): array
    {
        return [
            'userOwnership' => [
                'property' => null,
                'required' => false,
                'description' => 'owned pour les missions dont l’utilisateur courant est owner, not-owned pour les missions partagées via owners.',
            ],
        ];
    }
}
