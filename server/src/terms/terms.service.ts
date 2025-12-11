import {
    Injectable,
    NotFoundException,
    ConflictException,
    BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import { Term } from './entities/term.entity';
import { CreateTermDto, UpdateTermDto, QueryTermsDto } from './dto';
import {
    PaginatedResponse,
    createPaginatedResponse,
} from '../common/dto/pagination.dto';

@Injectable()
export class TermsService {
    constructor(
        @InjectRepository(Term)
        private readonly termRepository: Repository<Term>,
    ) { }

    async create(createDto: CreateTermDto, schoolId: string): Promise<Term> {
        // Validate dates
        const startDate = new Date(createDto.startDate);
        const endDate = new Date(createDto.endDate);

        if (endDate <= startDate) {
            throw new BadRequestException('End date must be after start date');
        }

        // Check for duplicate term number in academic year
        const existing = await this.termRepository.findOne({
            where: {
                academicYearId: createDto.academicYearId,
                termNumber: createDto.termNumber,
            },
        });

        if (existing) {
            throw new ConflictException(
                `Term ${createDto.termNumber} already exists in this academic year`,
            );
        }

        // If setting as current, unset other current terms
        if (createDto.isCurrent) {
            await this.unsetCurrentTerm(schoolId);
        }

        const term = this.termRepository.create({
            academicYearId: createDto.academicYearId,
            name: createDto.name,
            termNumber: createDto.termNumber,
            startDate,
            endDate,
            schoolId,
            isCurrent: createDto.isCurrent || false,
            resultPublishDate: createDto.resultPublishDate
                ? new Date(createDto.resultPublishDate)
                : undefined,
        });

        return this.termRepository.save(term);
    }

    async findAll(
        query: QueryTermsDto,
        schoolId: string,
    ): Promise<PaginatedResponse<Term>> {
        const queryBuilder = this.termRepository
            .createQueryBuilder('term')
            .where('term.school_id = :schoolId', { schoolId });

        if (query.academicYearId) {
            queryBuilder.andWhere('term.academic_year_id = :academicYearId', {
                academicYearId: query.academicYearId,
            });
        }

        if (query.isCurrent !== undefined) {
            queryBuilder.andWhere('term.is_current = :isCurrent', {
                isCurrent: query.isCurrent,
            });
        }

        if (query.isPublished !== undefined) {
            queryBuilder.andWhere('term.is_published = :isPublished', {
                isPublished: query.isPublished,
            });
        }

        queryBuilder.orderBy('term.term_number', 'ASC');

        const total = await queryBuilder.getCount();
        queryBuilder.skip(query.skip).take(query.take);

        const terms = await queryBuilder.getMany();
        return createPaginatedResponse(terms, total, query);
    }

    async findOne(id: string, schoolId: string): Promise<Term> {
        const term = await this.termRepository.findOne({
            where: { id, schoolId },
            relations: ['academicYear'],
        });

        if (!term) {
            throw new NotFoundException(`Term with ID ${id} not found`);
        }

        return term;
    }

    async findCurrent(schoolId: string): Promise<Term | null> {
        return this.termRepository.findOne({
            where: { schoolId, isCurrent: true },
            relations: ['academicYear'],
        });
    }

    async update(
        id: string,
        updateDto: UpdateTermDto,
        schoolId: string,
    ): Promise<Term> {
        const term = await this.findOne(id, schoolId);

        // Validate dates if updating
        if (updateDto.startDate || updateDto.endDate) {
            const startDate = updateDto.startDate
                ? new Date(updateDto.startDate)
                : term.startDate;
            const endDate = updateDto.endDate
                ? new Date(updateDto.endDate)
                : term.endDate;

            if (endDate <= startDate) {
                throw new BadRequestException('End date must be after start date');
            }
        }

        // If setting as current, unset other current terms
        if (updateDto.isCurrent && !term.isCurrent) {
            await this.unsetCurrentTerm(schoolId);
        }

        Object.assign(term, updateDto);

        if (updateDto.startDate) term.startDate = new Date(updateDto.startDate);
        if (updateDto.endDate) term.endDate = new Date(updateDto.endDate);
        if (updateDto.resultPublishDate) {
            term.resultPublishDate = new Date(updateDto.resultPublishDate);
        }

        return this.termRepository.save(term);
    }

    async remove(id: string, schoolId: string): Promise<void> {
        const term = await this.findOne(id, schoolId);
        await this.termRepository.remove(term);
    }

    async setCurrent(id: string, schoolId: string): Promise<Term> {
        const term = await this.findOne(id, schoolId);
        await this.unsetCurrentTerm(schoolId);
        term.isCurrent = true;
        return this.termRepository.save(term);
    }

    async publishResults(id: string, schoolId: string): Promise<Term> {
        const term = await this.findOne(id, schoolId);
        term.isPublished = true;
        term.resultPublishDate = new Date();
        return this.termRepository.save(term);
    }

    async getByAcademicYear(
        academicYearId: string,
        schoolId: string,
    ): Promise<Term[]> {
        return this.termRepository.find({
            where: { academicYearId, schoolId },
            order: { termNumber: 'ASC' },
        });
    }

    private async unsetCurrentTerm(schoolId: string): Promise<void> {
        await this.termRepository.update(
            { schoolId, isCurrent: true },
            { isCurrent: false },
        );
    }
}
