import {
    Injectable,
    NotFoundException,
    ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { School } from '../database/entities/school.entity';
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
     */
    async create(createSchoolDto: CreateSchoolDto): Promise<School> {
        // Check for duplicate code
        const existing = await this.schoolRepository.findOne({
            where: { code: createSchoolDto.code },
        });

        if (existing) {
            throw new ConflictException(
                `School with code ${createSchoolDto.code} already exists`,
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
