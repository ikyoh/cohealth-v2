<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260611120000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Track onboarding completion for new user accounts.';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE "user" ADD onboarding_completed BOOLEAN DEFAULT FALSE NOT NULL');
        $this->addSql('UPDATE "user" SET onboarding_completed = TRUE');
        $this->addSql('ALTER TABLE "user" ALTER onboarding_completed DROP DEFAULT');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE "user" DROP onboarding_completed');
    }
}
