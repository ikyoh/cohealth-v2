<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260114115133 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE "user" DROP CONSTRAINT fk_8d93d64986383b10');
        $this->addSql('DROP INDEX uniq_8d93d64986383b10');
        $this->addSql('ALTER TABLE "user" ADD file_path VARCHAR(255) DEFAULT NULL');
        $this->addSql('ALTER TABLE "user" DROP avatar_id');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE "user" ADD avatar_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE "user" DROP file_path');
        $this->addSql('ALTER TABLE "user" ADD CONSTRAINT fk_8d93d64986383b10 FOREIGN KEY (avatar_id) REFERENCES media_avatar (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('CREATE UNIQUE INDEX uniq_8d93d64986383b10 ON "user" (avatar_id)');
    }
}
