<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260609120000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Store event cooperators for planning visibility.';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('CREATE TABLE event_cooperator (event_id INT NOT NULL, user_id INT NOT NULL, PRIMARY KEY(event_id, user_id))');
        $this->addSql('CREATE INDEX IDX_B0EA38B771F7E88B ON event_cooperator (event_id)');
        $this->addSql('CREATE INDEX IDX_B0EA38B7A76ED395 ON event_cooperator (user_id)');
        $this->addSql('ALTER TABLE event_cooperator ADD CONSTRAINT FK_B0EA38B771F7E88B FOREIGN KEY (event_id) REFERENCES event (id) ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE event_cooperator ADD CONSTRAINT FK_B0EA38B7A76ED395 FOREIGN KEY (user_id) REFERENCES "user" (id) ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql(<<<'SQL'
            INSERT INTO event_cooperator (event_id, user_id)
            SELECT DISTINCT event.id, assigned_user.id
            FROM event
            CROSS JOIN LATERAL json_array_elements(COALESCE(event.services, '[]'::json)) AS service
            INNER JOIN "user" assigned_user
                ON '/users/' || assigned_user.uuid::text = service->'cooperator'->>'@id'
            WHERE service->'cooperator'->>'@id' IS NOT NULL
            ON CONFLICT DO NOTHING
            SQL);
    }

    public function down(Schema $schema): void
    {
        $this->addSql('DROP TABLE event_cooperator');
    }
}
