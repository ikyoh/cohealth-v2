<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260113094142 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE media_avatar ADD uuid UUID NOT NULL');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_AA0EE8F1D17F50A6 ON media_avatar (uuid)');
        $this->addSql('ALTER TABLE "user" DROP CONSTRAINT fk_8d93d64986383b10');
        $this->addSql('DROP INDEX uniq_8d93d64986383b10');
        $this->addSql('ALTER TABLE "user" DROP avatar_id');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('DROP INDEX UNIQ_AA0EE8F1D17F50A6');
        $this->addSql('ALTER TABLE media_avatar DROP uuid');
        $this->addSql('ALTER TABLE "user" ADD avatar_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE "user" ADD CONSTRAINT fk_8d93d64986383b10 FOREIGN KEY (avatar_id) REFERENCES media_object (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('CREATE UNIQUE INDEX uniq_8d93d64986383b10 ON "user" (avatar_id)');
    }
}
