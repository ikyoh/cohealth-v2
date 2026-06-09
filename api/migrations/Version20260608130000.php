<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260608130000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Link ROLE_PRINCIPAL users to their principal.';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE "user" ADD principal_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE "user" ADD CONSTRAINT FK_8D93D649474870EE FOREIGN KEY (principal_id) REFERENCES principal (id) ON DELETE SET NULL NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_8D93D649474870EE ON "user" (principal_id)');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE "user" DROP CONSTRAINT FK_8D93D649474870EE');
        $this->addSql('DROP INDEX UNIQ_8D93D649474870EE');
        $this->addSql('ALTER TABLE "user" DROP principal_id');
    }
}
