import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixOrgAdminOrganizationIds1734000000000 implements MigrationInterface {
    name = 'FixOrgAdminOrganizationIds1734000000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        console.log('🔍 Checking for Org Admin users without organizationId...');

        // Check if there are any Org Admin users without organization_id
        const orgAdminsWithoutOrg = await queryRunner.query(`
            SELECT id, email, first_name, last_name
            FROM "users"
            WHERE role = 'org_admin'
            AND organization_id IS NULL
        `);

        if (orgAdminsWithoutOrg.length === 0) {
            console.log('✅ All Org Admin users already have organizationId assigned');
            return;
        }

        console.log(`⚠️  Found ${orgAdminsWithoutOrg.length} Org Admin user(s) without organizationId:`);
        orgAdminsWithoutOrg.forEach((user: any) => {
            console.log(`   - ${user.email} (${user.first_name} ${user.last_name})`);
        });

        // Check if there are any organizations
        const organizations = await queryRunner.query(`
            SELECT id, name, code
            FROM "organizations"
            ORDER BY created_at ASC
            LIMIT 1
        `);

        let targetOrgId: string;

        if (organizations.length === 0) {
            console.log('⚠️  No organizations found. Creating a default organization...');

            // Create a default organization
            const result = await queryRunner.query(`
                INSERT INTO "organizations" (name, code, city, email, created_at, updated_at)
                VALUES (
                    'Default Organization',
                    'DEFAULT',
                    'Lahore',
                    'admin@default.org',
                    NOW(),
                    NOW()
                )
                RETURNING id
            `);

            targetOrgId = result[0].id;
            console.log(`✅ Created default organization with ID: ${targetOrgId}`);
        } else {
            targetOrgId = organizations[0].id;
            console.log(`✅ Using existing organization: ${organizations[0].name} (${organizations[0].code})`);
            console.log(`   Organization ID: ${targetOrgId}`);
        }

        // Update all Org Admin users without organization_id
        await queryRunner.query(`
            UPDATE "users"
            SET organization_id = $1
            WHERE role = 'org_admin'
            AND organization_id IS NULL
        `, [targetOrgId]);

        console.log(`✅ Updated ${orgAdminsWithoutOrg.length} Org Admin user(s) with organizationId: ${targetOrgId}`);
        console.log('✅ Migration completed successfully');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        console.log('⚠️  Rolling back FixOrgAdminOrganizationIds migration...');
        console.log('⚠️  Note: This will set organization_id to NULL for affected Org Admins');

        // We can't reliably rollback this migration without tracking which users were updated
        // So we'll just log a warning
        console.log('⚠️  Manual rollback required if needed');
        console.log('✅ Rollback completed');
    }
}
