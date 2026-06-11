<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260115144536 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE "user" ADD uuid UUID NOT NULL');
        $this->addSql('ALTER TABLE "user" ADD rcc VARCHAR(7) DEFAULT NULL');
        $this->addSql('ALTER TABLE "user" ADD gln VARCHAR(13) DEFAULT NULL');
        $this->addSql('ALTER TABLE "user" ADD mobile VARCHAR(12) DEFAULT NULL');
        $this->addSql('ALTER TABLE "user" ADD phone VARCHAR(12) DEFAULT NULL');
        $this->addSql('ALTER TABLE "user" ADD fax VARCHAR(12) DEFAULT NULL');
        $this->addSql('ALTER TABLE "user" ADD address VARCHAR(255) NOT NULL');
        $this->addSql('ALTER TABLE "user" ADD post_code VARCHAR(255) DEFAULT NULL');
        $this->addSql('ALTER TABLE "user" ADD city VARCHAR(255) DEFAULT NULL');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_8D93D649D17F50A6 ON "user" (uuid)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('DROP INDEX UNIQ_8D93D649D17F50A6');
        $this->addSql('ALTER TABLE "user" DROP uuid');
        $this->addSql('ALTER TABLE "user" DROP rcc');
        $this->addSql('ALTER TABLE "user" DROP gln');
        $this->addSql('ALTER TABLE "user" DROP mobile');
        $this->addSql('ALTER TABLE "user" DROP phone');
        $this->addSql('ALTER TABLE "user" DROP fax');
        $this->addSql('ALTER TABLE "user" DROP address');
        $this->addSql('ALTER TABLE "user" DROP post_code');
        $this->addSql('ALTER TABLE "user" DROP city');
    }
}
