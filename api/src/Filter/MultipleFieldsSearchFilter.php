<?php

// src/Filter/MultipleFieldsSearchFilter.php

namespace App\Filter;

use ApiPlatform\Doctrine\Orm\Filter\AbstractFilter;
use ApiPlatform\Doctrine\Orm\Util\QueryNameGeneratorInterface;
use ApiPlatform\Metadata\Operation;
use Doctrine\ORM\QueryBuilder;


final class MultipleFieldsSearchFilter extends AbstractFilter
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
    if ($property !== 'search') {
      return;
    }

    $fields = $this->getProperties();
    if (empty($fields)) {
      throw new \InvalidArgumentException('At least one field must be specified.');
    }

    $alias = $queryBuilder->getRootAliases()[0];
    $orExpressions = [];
    foreach (array_keys($fields) as $k => $field) {
      if ($this->isPropertyNested($field, $resourceClass)) {
        $exploded_field = explode('.', $field);
        if (!in_array($exploded_field[0], $queryBuilder->getAllAliases())) {
          $queryBuilder->leftJoin($alias . '.' . $exploded_field[0], $exploded_field[0]);
        }

        $fieldType = $this->getDoctrineFieldType($field, $resourceClass);
        $expression = $this->buildSearchExpression($exploded_field[0], $exploded_field[1], $fieldType);
      } else {
        $fieldType = $this->getDoctrineFieldType($field, $resourceClass);
        $expression = $this->buildSearchExpression($alias, $field, $fieldType);
      }

      if (null !== $expression) {
        $orExpressions[] = $expression;
      }
    }

    if (empty($orExpressions)) {
      return;
    }

    $queryBuilder
      ->andWhere(implode(' OR ', $orExpressions))
      ->setParameter('search', "%$value%");
  }

  private function buildSearchExpression(string $alias, string $field, ?string $fieldType): ?string
  {
    $fieldReference = sprintf('%s.%s', $alias, $field);

    // For text fields, use direct LOWER
    if (null === $fieldType || in_array($fieldType, ['string', 'text', 'json', 'json_array', 'simple_array', 'array'], true)) {
      return sprintf('LOWER(%s) LIKE LOWER(:search)', $fieldReference);
    }

    // For uuid and guid fields, cast to text first
    if (in_array($fieldType, ['guid', 'uuid'], true)) {
      return sprintf('CAST(%s AS TEXT) LIKE :search', $fieldReference);
    }

    // For integer and other numeric types, convert to text
    if (in_array($fieldType, ['integer', 'bigint', 'smallint'], true)) {
      return sprintf('CAST(%s AS TEXT) LIKE :search', $fieldReference);
    }

    // Default: try to cast to text
    return sprintf('CAST(%s AS TEXT) LIKE :search', $fieldReference);
  }

  // This function is only used to hook in documentation generators (supported by Swagger and Hydra)
  public function getDescription(string $resourceClass): array
  {
    if (!$this->properties) {
      return [];
    }

    $description = [];

    return $description;
  }
}
