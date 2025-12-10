import {
    Injectable,
    NotFoundException,
    ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Organization } from '../database/entities/organization.entity';
import { CreateOrganizationDto, UpdateOrganizationDto } from './dto';

/**
 * Service for managing organizations (school chains).
 */
@Injectable()
export class OrganizationsService {
    constructor(
        @InjectRepository(Organization)
        private readonly orgRepository: Repository<Organization>,
    ) { }

    /**
     * Create a new organization.
     */
    async create(dto: CreateOrganizationDto): Promise<Organization> {
        // Check for duplicate code
        const existing = await this.orgRepository.findOne({
            where: { code: dto.code },
        });

        if (existing) {
            throw new ConflictException(`Organization with code ${dto.code} already exists`);
        }

        const org = this.orgRepository.create(dto);
        return this.orgRepository.save(org);
    }

    /**
     * Find all organizations.
     */
    async findAll(): Promise<Organization[]> {
        return this.orgRepository.find({
            order: { name: 'ASC' },
            relations: ['schools'],
        });
    }

    /**
     * Find an organization by ID.
     */
    async findOne(id: string): Promise<Organization> {
        const org = await this.orgRepository.findOne({
            where: { id },
            relations: ['schools'],
        });

        if (!org) {
            throw new NotFoundException(`Organization with ID ${id} not found`);
        }

        return org;
    }

    /**
     * Update an organization.
     */
    async update(id: string, dto: UpdateOrganizationDto): Promise<Organization> {
        const org = await this.findOne(id);

        if (dto.code && dto.code !== org.code) {
            const existing = await this.orgRepository.findOne({
                where: { code: dto.code },
            });
            if (existing) {
                throw new ConflictException(`Organization with code ${dto.code} already exists`);
            }
        }

        Object.assign(org, dto);
        return this.orgRepository.save(org);
    }

    /**
     * Soft delete an organization.
     */
    async remove(id: string): Promise<void> {
        const org = await this.findOne(id);
        await this.orgRepository.softRemove(org);
    }
}
