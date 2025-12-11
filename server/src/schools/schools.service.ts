import {
    Injectable,
    NotFoundException,
    ConflictException,
    ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { School } from '../database/entities/school.entity';
import { User, UserRole } from '../database/entities/user.entity';
import { CreateSchoolDto, UpdateSchoolDto } from './dto';

/**
 * Service for managing schools.
 */
@Injectable()
export class SchoolsService {
    constructor(
        @InjectRepository(School)
        private readonly schoolRepository: Repository<School>,
    ) { }

    /**
     * Create a new school.
     * Super Admin can create in any organization.
     * Org Admin can only create in their own organization.
     */
    async create(createSchoolDto: CreateSchoolDto, creator: User): Promise<School> {
        // Org Admin validation: must create school in their own organization
        if (creator.role === UserRole.ORG_ADMIN) {
            if (!creator.organizationId) {
                throw new ForbiddenException('Org Admin must be associated with an organization');
            }

            // If organizationId provided in DTO, must match creator's organization
            if (createSchoolDto.organizationId && createSchoolDto.organizationId !== creator.organizationId) {
                throw new ForbiddenException('Org Admin can only create schools within their own organization');
            }

            // Auto-set organizationId to creator's organization
            createSchoolDto.organizationId = creator.organizationId;
        }

        // Super Admin: organizationId must be provided in DTO
        if (creator.role === UserRole.SUPER_ADMIN && !createSchoolDto.organizationId) {
            throw new ConflictException('organizationId is required when creating a school');
        }

        // Check for duplicate code within the organization
        const existing = await this.schoolRepository.findOne({
            where: {
                code: createSchoolDto.code,
                organizationId: createSchoolDto.organizationId,
            },
        });

        if (existing) {
            throw new ConflictException(
                `School with code ${createSchoolDto.code} already exists in this organization`,
            );
        }

        const school = this.schoolRepository.create(createSchoolDto);
        return this.schoolRepository.save(school);
    }

    /**
     * Find all schools (Super Admin only).
     */
    async findAll(): Promise<School[]> {
        return this.schoolRepository.find({
            order: { name: 'ASC' },
        });
    }

    /**
     * Find a school by ID.
     */
    async findOne(id: string): Promise<School> {
        const school = await this.schoolRepository.findOne({
            where: { id },
        });

        if (!school) {
            throw new NotFoundException(`School with ID ${id} not found`);
        }

        return school;
    }

    /**
     * Find a school by code.
     */
    async findByCode(code: string): Promise<School | null> {
        return this.schoolRepository.findOne({
            where: { code },
        });
    }

    /**
     * Update a school.
     */
    async update(id: string, updateSchoolDto: UpdateSchoolDto): Promise<School> {
        const school = await this.findOne(id);

        // Check for duplicate code if updating it
        if (updateSchoolDto.code && updateSchoolDto.code !== school.code) {
            const existing = await this.findByCode(updateSchoolDto.code);
            if (existing) {
                throw new ConflictException(
                    `School with code ${updateSchoolDto.code} already exists`,
                );
            }
        }

        Object.assign(school, updateSchoolDto);
        return this.schoolRepository.save(school);
    }

    /**
     * Soft delete a school.
     */
    async remove(id: string): Promise<void> {
        const school = await this.findOne(id);
        await this.schoolRepository.softRemove(school);
    }
}
