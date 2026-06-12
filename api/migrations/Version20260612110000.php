<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260612110000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Add an explicit duration in minutes to events.';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE event ADD duration INT DEFAULT NULL');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE event DROP duration');
    }
}
