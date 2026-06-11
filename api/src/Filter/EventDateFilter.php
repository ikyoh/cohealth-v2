<?php

// src/Filter/EventDateFilter.php


namespace App\Filter;

use ApiPlatform\Doctrine\Orm\Filter\AbstractFilter;
use ApiPlatform\Doctrine\Orm\Util\QueryNameGeneratorInterface;
use ApiPlatform\Metadata\Operation;
use Doctrine\ORM\QueryBuilder;


class EventDateFilter extends AbstractFilter
{
    protected function filterProperty(
        string $property,
        $value,
        QueryBuilder $queryBuilder,
        QueryNameGeneratorInterface $queryNameGenerator,
        string $resourceClass,
        ?Operation $operation = null,
        array $context = []
    ): void {
        if (!$value) {
            return;
        }

        $alias = $queryBuilder->getRootAliases()[0];

        // � Cas 1 : date comprise entre beginDate et endDate
        if ($property === 'date') {
            $date = new \DateTimeImmutable($value);

            $queryBuilder
                ->andWhere(':date BETWEEN ' . $alias . '.beginDate AND ' . $alias . '.endDate')
                ->setParameter('date', $date);

            return;
        }

        // �️ Cas 2 : events de la semaine de la date
        if ($property === 'week') {
            $date = new \DateTimeImmutable($value);

            $startOfWeek = $date
                ->modify('monday this week')
                ->setTime(0, 0, 0);

            $endOfWeek = $date
                ->modify('sunday this week')
                ->setTime(23, 59, 59);

            $queryBuilder
                ->andWhere($alias . '.beginDate <= :endWeek')
                ->andWhere($alias . '.endDate >= :startWeek')
                ->setParameter('startWeek', $startOfWeek)
                ->setParameter('endWeek', $endOfWeek);
        }
    }

    public function getDescription(string $resourceClass): array
    {
        return [
            'date' => [
                'property' => null,
                'required' => false,
                'description' => 'Events actifs à cette date (YYYY-MM-DD)',
            ],
            'week' => [
                'property' => null,
                'required' => false,
                'description' => 'Events chevauchant la semaine de la date (YYYY-MM-DD)',
            ],
        ];
    }
}
