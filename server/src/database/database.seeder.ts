import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole, UserStatus } from './entities/user.entity';

/**
 * Seeds the default Super Admin on application startup.
 * Only creates if no Super Admin exists.
 */
@Injectable()
export class DatabaseSeeder implements OnModuleInit {
    private readonly logger = new Logger(DatabaseSeeder.name);

    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) { }

    async onModuleInit() {
        await this.seedSuperAdmin();
    }

    private async seedSuperAdmin() {
        // Check by role
        const existingSuperAdmin = await this.userRepository.findOne({
            where: { role: UserRole.SUPER_ADMIN },
        });

        if (existingSuperAdmin) {
            this.logger.log(`Super Admin already exists: ${existingSuperAdmin.email} (ID: ${existingSuperAdmin.id})`);

            // Check if the existing super admin has the correct email
            if (existingSuperAdmin.email !== 'super@eduflow.pk') {
                this.logger.warn(`⚠️ Super Admin has different email: ${existingSuperAdmin.email}`);
                this.logger.warn(`⚠️ Expected: super@eduflow.pk`);
                this.logger.warn(`⚠️ Updating Super Admin email to super@eduflow.pk...`);

                existingSuperAdmin.email = 'super@eduflow.pk';
                const passwordHash = await bcrypt.hash('AdminPass123!', 12);
                existingSuperAdmin.passwordHash = passwordHash;
                await this.userRepository.save(existingSuperAdmin);

                this.logger.log(`✅ Super Admin updated: super@eduflow.pk / AdminPass123!`);
            } else {
                this.logger.log(`✅ Super Admin found by email: ${existingSuperAdmin.email}`);
            }
            return;
        }

        this.logger.log('Creating new Super Admin...');
        const passwordHash = await bcrypt.hash('AdminPass123!', 12);

        const superAdmin = this.userRepository.create({
            email: 'super@eduflow.pk',
            passwordHash,
            firstName: 'Super',
            lastName: 'Admin',
            role: UserRole.SUPER_ADMIN,
            status: UserStatus.ACTIVE,
            emailVerified: true,
        });

        await this.userRepository.save(superAdmin);

        this.logger.log('✅ Super Admin seeded: super@eduflow.pk / AdminPass123!');
        this.logger.log(`   ID: ${superAdmin.id}, Role: ${superAdmin.role}, Status: ${superAdmin.status}`);
    }
}
