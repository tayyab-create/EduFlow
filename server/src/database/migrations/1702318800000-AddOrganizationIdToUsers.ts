import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddOrganizationIdToUsers1702318800000 implements MigrationInterface {
    name = 'AddOrganizationIdToUsers1702318800000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add organization_id column to users table
        await queryRunner.query(`
            ALTER TABLE "users"
            ADD COLUMN "organization_id" uuid
        `);

        // Create index on organization_id for better query performance
        await queryRunner.query(`
            CREATE INDEX "IDX_users_organization_id"
            ON "users" ("organization_id")
        `);

        // Add foreign key constraint to organizations table
        await queryRunner.query(`
            ALTER TABLE "users"
            ADD CONSTRAINT "FK_users_organization"
            FOREIGN KEY ("organization_id")
            REFERENCES "organizations"("id")
            ON DELETE SET NULL
        `);

        // ✅ Auto-populate organization_id for existing users based on their school's organization
        await queryRunner.query(`
            UPDATE "users" u
            SET "organization_id" = s."organization_id"
            FROM "schools" s
            WHERE u."school_id" = s."id"
            AND u."organization_id" IS NULL
        `);

        console.log('✅ Migration completed: Added organization_id to users table');
        console.log('✅ Existing users linked to their school\'s organization');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remove foreign key constraint
        await queryRunner.query(`
            ALTER TABLE "users"
            DROP CONSTRAINT "FK_users_organization"
        `);

        // Remove index
        await queryRunner.query(`
            DROP INDEX "IDX_users_organization_id"
        `);

        // Remove column
        await queryRunner.query(`
            ALTER TABLE "users"
            DROP COLUMN "organization_id"
        `);

        console.log('✅ Migration rolled back: Removed organization_id from users table');
    }
}
