<?php

namespace App\Doctrine;

use Doctrine\ORM\Query\AST\Functions\FunctionNode;
use Doctrine\ORM\Query\Parser;
use Doctrine\ORM\Query\SqlWalker;
use Doctrine\ORM\Query\TokenType;

class CastFunction extends FunctionNode
{
  public $field;
  public $type;

  public function getSql(SqlWalker $sqlWalker): string
  {
    $typeMap = [
      'STRING' => 'TEXT',
      'TEXT' => 'TEXT',
      'VARCHAR' => 'VARCHAR',
      'INTEGER' => 'INTEGER',
      'INT' => 'INTEGER',
    ];

    $targetType = $typeMap[$this->type] ?? $this->type;

    return 'CAST(' . $this->field->dispatch($sqlWalker) . ' AS ' . $targetType . ')';
  }

  public function parse(Parser $parser): void
  {
    $parser->match(TokenType::T_IDENTIFIER);
    $parser->match(TokenType::T_OPEN_PARENTHESIS);

    $this->field = $parser->ArithmeticExpression();

    $parser->match(TokenType::T_AS);

    $this->type = $parser->getLexer()->lookahead->value;
    $parser->match(TokenType::T_IDENTIFIER);

    $parser->match(TokenType::T_CLOSE_PARENTHESIS);
  }
}
