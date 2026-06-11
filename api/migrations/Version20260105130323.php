<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260105130323 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE patient ADD insurance_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE patient ADD principal_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE patient ADD CONSTRAINT FK_1ADAD7EBD1E63CD1 FOREIGN KEY (insurance_id) REFERENCES insurance (id)');
        $this->addSql('ALTER TABLE patient ADD CONSTRAINT FK_1ADAD7EB474870EE FOREIGN KEY (principal_id) REFERENCES principal (id)');
        $this->addSql('CREATE INDEX IDX_1ADAD7EBD1E63CD1 ON patient (insurance_id)');
        $this->addSql('CREATE INDEX IDX_1ADAD7EB474870EE ON patient (principal_id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE patient DROP CONSTRAINT FK_1ADAD7EBD1E63CD1');
        $this->addSql('ALTER TABLE patient DROP CONSTRAINT FK_1ADAD7EB474870EE');
        $this->addSql('DROP INDEX IDX_1ADAD7EBD1E63CD1');
        $this->addSql('DROP INDEX IDX_1ADAD7EB474870EE');
        $this->addSql('ALTER TABLE patient DROP insurance_id');
        $this->addSql('ALTER TABLE patient DROP principal_id');
    }
}
