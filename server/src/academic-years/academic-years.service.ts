import {
    Injectable,
    NotFoundException,
    ConflictException,
    BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import { AcademicYear } from './entities/academic-year.entity';
import {
    CreateAcademicYearDto,
    UpdateAcademicYearDto,
    QueryAcademicYearsDto,
} from './dto';
import {
    PaginatedResponse,
    createPaginatedResponse,
} from '../common/dto/pagination.dto';

/**
 * Service for managing academic years.
 * All methods enforce multi-tenancy via schoolId parameter.
 */
@Injectable()
export class AcademicYearsService {
    constructor(
        @InjectRepository(AcademicYear)
        private readonly academicYearRepository: Repository<AcademicYear>,
    ) { }

    /**
     * Create a new academic year within a school.
     */
    async create(
        createDto: CreateAcademicYearDto,
        schoolId: string,
    ): Promise<AcademicYear> {
        // Validate date range
        const startDate = new Date(createDto.startDate);
        const endDate = new Date(createDto.endDate);

        if (endDate <= startDate) {
            throw new BadRequestException('End date must be after start date');
        }

        // Check for duplicate name within school
        const existing = await this.academicYearRepository.findOne({
            where: { schoolId, name: createDto.name },
        });

        if (existing) {
            throw new ConflictException(
                `Academic year ${createDto.name} already exists`,
            );
        }

        // If setting as current, unset other current years
        if (createDto.isCurrent) {
            await this.unsetCurrentYear(schoolId);
        }

        const academicYear = this.academicYearRepository.create({
            ...createDto,
            startDate,
            endDate,
            schoolId,
        });

        return this.academicYearRepository.save(academicYear);
    }

    /**
     * Find all academic years with pagination and filtering.
     */
    async findAll(
        query: QueryAcademicYearsDto,
        schoolId: string,
    ): Promise<PaginatedResponse<AcademicYear>> {
        const queryBuilder = this.academicYearRepository
            .createQueryBuilder('academicYear')
            .where('academicYear.school_id = :schoolId', { schoolId });

        // Filter by current status
        if (query.isCurrent !== undefined) {
            queryBuilder.andWhere('academicYear.is_current = :isCurrent', {
                isCurrent: query.isCurrent,
            });
        }

        // Order by start date descending (most recent first)
        queryBuilder.orderBy('academicYear.start_date', 'DESC');

        // Get total count
        const total = await queryBuilder.getCount();

        // Apply pagination
        queryBuilder.skip(query.skip).take(query.take);

        const academicYears = await queryBuilder.getMany();

        return createPaginatedResponse(academicYears, total, query);
    }

    /**
     * Find a single academic year by ID within a school.
     */
    async findOne(id: string, schoolId: string): Promise<AcademicYear> {
        const academicYear = await this.academicYearRepository.findOne({
            where: { id, schoolId },
        });

        if (!academicYear) {
            throw new NotFoundException(`Academic year with ID ${id} not found`);
        }

        return academicYear;
    }

    /**
     * Find the current academic year for a school.
     */
    async findCurrent(schoolId: string): Promise<AcademicYear | null> {
        return this.academicYearRepository.findOne({
            where: { schoolId, isCurrent: true },
        });
    }

    /**
     * Update an academic year.
     */
    async update(
        id: string,
        updateDto: UpdateAcademicYearDto,
        schoolId: string,
    ): Promise<AcademicYear> {
        const academicYear = await this.findOne(id, schoolId);

        // Validate date range if dates are being updated
        if (updateDto.startDate || updateDto.endDate) {
            const startDate = updateDto.startDate
                ? new Date(updateDto.startDate)
                : academicYear.startDate;
            const endDate = updateDto.endDate
                ? new Date(updateDto.endDate)
                : academicYear.endDate;

            if (endDate <= startDate) {
                throw new BadRequestException('End date must be after start date');
            }
        }

        // Check for duplicate name if updating name
        if (updateDto.name && updateDto.name !== academicYear.name) {
            const existing = await this.academicYearRepository.findOne({
                where: { schoolId, name: updateDto.name, id: Not(id) },
            });

            if (existing) {
                throw new ConflictException(
                    `Academic year ${updateDto.name} already exists`,
                );
            }
        }

        // If setting as current, unset other current years
        if (updateDto.isCurrent && !academicYear.isCurrent) {
            await this.unsetCurrentYear(schoolId);
        }

        Object.assign(academicYear, updateDto);
        return this.academicYearRepository.save(academicYear);
    }

    /**
     * Delete an academic year.
     * Note: This is a hard delete. Consider soft delete for production.
     */
    async remove(id: string, schoolId: string): Promise<void> {
        const academicYear = await this.findOne(id, schoolId);

        // TODO: Check for dependent records (terms, classes) before deleting

        await this.academicYearRepository.remove(academicYear);
    }

    /**
     * Set an academic year as current.
     * Automatically unsets other current years within the same school.
     */
    async setCurrent(id: string, schoolId: string): Promise<AcademicYear> {
        const academicYear = await this.findOne(id, schoolId);

        await this.unsetCurrentYear(schoolId);

        academicYear.isCurrent = true;
        return this.academicYearRepository.save(academicYear);
    }

    /**
     * Helper to unset current academic year for a school.
     */
    private async unsetCurrentYear(schoolId: string): Promise<void> {
        await this.academicYearRepository.update(
            { schoolId, isCurrent: true },
            { isCurrent: false },
        );
    }
}
