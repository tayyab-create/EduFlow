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
        const existingSuperAdmin = await this.userRepository.findOne({
            where: { role: UserRole.SUPER_ADMIN },
        });

        if (existingSuperAdmin) {
            this.logger.log('Super Admin already exists, skipping seed');
            return;
        }

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
    }
}
