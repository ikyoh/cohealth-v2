<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260612100000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Attach recurrence exceptions to events and store occurrence overrides.';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE event_exception ADD event_id INT NOT NULL');
        $this->addSql('ALTER TABLE event_exception ADD title VARCHAR(255) DEFAULT NULL');
        $this->addSql('ALTER TABLE event_exception ADD description VARCHAR(255) DEFAULT NULL');
        $this->addSql('ALTER TABLE event_exception ADD is_allday BOOLEAN DEFAULT NULL');
        $this->addSql('ALTER TABLE event_exception ADD services JSON DEFAULT NULL');
        $this->addSql('CREATE INDEX IDX_F95CB05071F7E88B ON event_exception (event_id)');
        $this->addSql('CREATE UNIQUE INDEX uniq_event_exception_occurrence ON event_exception (event_id, original_date)');
        $this->addSql('ALTER TABLE event_exception ADD CONSTRAINT FK_EB25948171F7E88B FOREIGN KEY (event_id) REFERENCES event (id) ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE event_exception DROP CONSTRAINT FK_EB25948171F7E88B');
        $this->addSql('DROP INDEX IDX_F95CB05071F7E88B');
        $this->addSql('DROP INDEX uniq_event_exception_occurrence');
        $this->addSql('ALTER TABLE event_exception DROP event_id');
        $this->addSql('ALTER TABLE event_exception DROP title');
        $this->addSql('ALTER TABLE event_exception DROP description');
        $this->addSql('ALTER TABLE event_exception DROP is_allday');
        $this->addSql('ALTER TABLE event_exception DROP services');
    }
}
