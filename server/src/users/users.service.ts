import {
    Injectable,
    NotFoundException,
    ConflictException,
    ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole, UserStatus } from '../database/entities/user.entity';
import { School } from '../database/entities/school.entity';
import { Organization } from '../database/entities/organization.entity';
import { CreateUserDto, UpdateUserDto } from './dto';

/**
 * Users service with hierarchical permission enforcement.
 * Enforces parent-child creation rules.
 */
@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(School)
        private readonly schoolRepository: Repository<School>,
        @InjectRepository(Organization)
        private readonly orgRepository: Repository<Organization>,
    ) { }

    /**
     * Check if creator can create a user with target role.
     */
    private canCreateRole(creatorRole: UserRole, targetRole: UserRole): boolean {
        const hierarchy: Record<UserRole, UserRole[]> = {
            [UserRole.SUPER_ADMIN]: [
                UserRole.ORG_ADMIN,
                UserRole.SCHOOL_ADMIN,
                UserRole.PRINCIPAL,
                UserRole.VICE_PRINCIPAL,
                UserRole.TEACHER,
                UserRole.ACCOUNTANT,
                UserRole.HR,
                UserRole.LIBRARIAN,
                UserRole.RECEPTIONIST,
            ],
            [UserRole.ORG_ADMIN]: [
                UserRole.ORG_ADMIN,
                UserRole.SCHOOL_ADMIN,
                UserRole.PRINCIPAL,
                UserRole.VICE_PRINCIPAL,
                UserRole.TEACHER,
                UserRole.ACCOUNTANT,
                UserRole.HR,
                UserRole.LIBRARIAN,
                UserRole.RECEPTIONIST,
            ],
            [UserRole.SCHOOL_ADMIN]: [
                UserRole.PRINCIPAL,
                UserRole.VICE_PRINCIPAL,
                UserRole.TEACHER,
                UserRole.ACCOUNTANT,
                UserRole.HR,
                UserRole.LIBRARIAN,
                UserRole.RECEPTIONIST,
            ],
            [UserRole.PRINCIPAL]: [],
            [UserRole.VICE_PRINCIPAL]: [],
            [UserRole.TEACHER]: [],
            [UserRole.ACCOUNTANT]: [],
            [UserRole.HR]: [],
            [UserRole.LIBRARIAN]: [],
            [UserRole.RECEPTIONIST]: [],
            [UserRole.PARENT]: [],
            [UserRole.STUDENT]: [],
        };

        return hierarchy[creatorRole]?.includes(targetRole) || false;
    }

    /**
     * Validate org/school scope for creation.
     */
    private async validateScope(
        creator: User,
        dto: CreateUserDto,
    ): Promise<void> {
        // Super Admin can create for any org/school
        if (creator.role === UserRole.SUPER_ADMIN) {
            return;
        }

        // Org Admin can only create for schools in their org
        if (creator.role === UserRole.ORG_ADMIN) {
            if (dto.schoolId) {
                const school = await this.schoolRepository.findOne({
                    where: { id: dto.schoolId },
                });
                if (!school || school.organizationId !== creator.schoolId) {
                    // Note: Org admin's orgId would be stored differently
                    throw new ForbiddenException('School is not in your organization');
                }
            }
            return;
        }

        // School Admin can only create for their school
        if (creator.role === UserRole.SCHOOL_ADMIN) {
            if (dto.schoolId && dto.schoolId !== creator.schoolId) {
                throw new ForbiddenException('Cannot create users for other schools');
            }
            // Force schoolId to creator's school
            dto.schoolId = creator.schoolId;
        }
    }

    /**
     * Create a user with hierarchical permission validation.
     */
    async create(creator: User, dto: CreateUserDto): Promise<User> {
        // Check if creator can create this role
        if (!this.canCreateRole(creator.role, dto.role)) {
            throw new ForbiddenException(
                `${creator.role} cannot create ${dto.role} users`,
            );
        }

        // Validate org/school scope
        await this.validateScope(creator, dto);

        // Check for duplicate email
        const existing = await this.userRepository.findOne({
            where: { email: dto.email },
        });
        if (existing) {
            throw new ConflictException('Email already registered');
        }

        // Hash password
        const passwordHash = await bcrypt.hash(dto.password, 12);

        // Create user
        const user = this.userRepository.create({
            email: dto.email,
            passwordHash,
            firstName: dto.firstName,
            lastName: dto.lastName,
            phone: dto.phone,
            role: dto.role,
            status: UserStatus.ACTIVE,
            schoolId: dto.schoolId,
        });

        return this.userRepository.save(user);
    }

    /**
     * Find all users (filtered by creator's scope).
     */
    async findAll(creator: User): Promise<User[]> {
        const query = this.userRepository.createQueryBuilder('user');

        if (creator.role === UserRole.SUPER_ADMIN) {
            // See all users
        } else if (creator.role === UserRole.ORG_ADMIN) {
            // See users in their organization's schools
            query
                .innerJoin('user.school', 'school')
                .where('school.organizationId = :orgId', { orgId: creator.schoolId });
        } else if (creator.role === UserRole.SCHOOL_ADMIN) {
            // See users in their school
            query.where('user.schoolId = :schoolId', { schoolId: creator.schoolId });
        } else {
            // Others can only see themselves
            query.where('user.id = :userId', { userId: creator.id });
        }

        return query.getMany();
    }

    /**
     * Find user by ID.
     */
    async findOne(id: string): Promise<User> {
        const user = await this.userRepository.findOne({
            where: { id },
            relations: ['school'],
        });

        if (!user) {
            throw new NotFoundException(`User ${id} not found`);
        }

        return user;
    }

    /**
     * Update user.
     */
    async update(id: string, dto: UpdateUserDto): Promise<User> {
        const user = await this.findOne(id);

        if (dto.password) {
            user.passwordHash = await bcrypt.hash(dto.password, 12);
        }

        Object.assign(user, {
            ...dto,
            password: undefined, // Don't save raw password
        });

        return this.userRepository.save(user);
    }

    /**
     * Deactivate user (soft delete).
     */
    async remove(id: string): Promise<void> {
        const user = await this.findOne(id);
        user.status = UserStatus.SUSPENDED;
        await this.userRepository.save(user);
    }
}
