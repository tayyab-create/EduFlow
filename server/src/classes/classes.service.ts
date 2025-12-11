import {
    Injectable,
    NotFoundException,
    ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Class } from './entities/class.entity';
import { Section } from './entities/section.entity';
import {
    CreateClassDto,
    UpdateClassDto,
    CreateSectionDto,
    UpdateSectionDto,
    QueryClassesDto,
    QuerySectionsDto,
} from './dto';
import {
    PaginatedResponse,
    createPaginatedResponse,
} from '../common/dto/pagination.dto';

/**
 * Service for managing classes and sections.
 * All methods enforce multi-tenancy via schoolId parameter.
 */
@Injectable()
export class ClassesService {
    constructor(
        @InjectRepository(Class)
        private readonly classRepository: Repository<Class>,
        @InjectRepository(Section)
        private readonly sectionRepository: Repository<Section>,
    ) { }

    // ==================== CLASS METHODS ====================

    async createClass(
        createDto: CreateClassDto,
        schoolId: string,
    ): Promise<Class> {
        // Check for duplicate name within school and academic year
        const existing = await this.classRepository.findOne({
            where: {
                schoolId,
                academicYearId: createDto.academicYearId,
                name: createDto.name,
            },
        });

        if (existing) {
            throw new ConflictException(
                `Class ${createDto.name} already exists in this academic year`,
            );
        }

        const classEntity = this.classRepository.create({
            ...createDto,
            schoolId,
        });

        return this.classRepository.save(classEntity);
    }

    async findAllClasses(
        query: QueryClassesDto,
        schoolId: string,
    ): Promise<PaginatedResponse<Class>> {
        const queryBuilder = this.classRepository
            .createQueryBuilder('class')
            .where('class.school_id = :schoolId', { schoolId });

        // Filter by academic year
        if (query.academicYearId) {
            queryBuilder.andWhere('class.academic_year_id = :academicYearId', {
                academicYearId: query.academicYearId,
            });
        }

        // Order by display order, then grade level
        queryBuilder
            .orderBy('class.display_order', 'ASC')
            .addOrderBy('class.grade_level', 'ASC');

        const total = await queryBuilder.getCount();
        queryBuilder.skip(query.skip).take(query.take);

        const classes = await queryBuilder.getMany();
        return createPaginatedResponse(classes, total, query);
    }

    async findOneClass(id: string, schoolId: string): Promise<Class> {
        const classEntity = await this.classRepository.findOne({
            where: { id, schoolId },
            relations: ['academicYear'],
        });

        if (!classEntity) {
            throw new NotFoundException(`Class with ID ${id} not found`);
        }

        return classEntity;
    }

    async updateClass(
        id: string,
        updateDto: UpdateClassDto,
        schoolId: string,
    ): Promise<Class> {
        const classEntity = await this.findOneClass(id, schoolId);

        // Check for duplicate name if updating
        if (updateDto.name && updateDto.name !== classEntity.name) {
            const existing = await this.classRepository.findOne({
                where: {
                    schoolId,
                    academicYearId: classEntity.academicYearId,
                    name: updateDto.name,
                },
            });

            if (existing) {
                throw new ConflictException(
                    `Class ${updateDto.name} already exists in this academic year`,
                );
            }
        }

        Object.assign(classEntity, updateDto);
        return this.classRepository.save(classEntity);
    }

    async removeClass(id: string, schoolId: string): Promise<void> {
        const classEntity = await this.findOneClass(id, schoolId);
        await this.classRepository.remove(classEntity);
    }

    // ==================== SECTION METHODS ====================

    async createSection(
        createDto: CreateSectionDto,
        schoolId: string,
    ): Promise<Section> {
        // Verify class belongs to school
        const classEntity = await this.findOneClass(createDto.classId, schoolId);

        // Check for duplicate section name within class
        const existing = await this.sectionRepository.findOne({
            where: {
                classId: createDto.classId,
                name: createDto.name,
            },
        });

        if (existing) {
            throw new ConflictException(
                `Section ${createDto.name} already exists in this class`,
            );
        }

        const section = this.sectionRepository.create(createDto);
        return this.sectionRepository.save(section);
    }

    async findAllSections(
        query: QuerySectionsDto,
        schoolId: string,
    ): Promise<PaginatedResponse<Section>> {
        const queryBuilder = this.sectionRepository
            .createQueryBuilder('section')
            .innerJoin('section.class', 'class')
            .where('class.school_id = :schoolId', { schoolId });

        // Filter by class
        if (query.classId) {
            queryBuilder.andWhere('section.class_id = :classId', {
                classId: query.classId,
            });
        }

        queryBuilder.orderBy('section.name', 'ASC');

        const total = await queryBuilder.getCount();
        queryBuilder.skip(query.skip).take(query.take);

        const sections = await queryBuilder.getMany();
        return createPaginatedResponse(sections, total, query);
    }

    async findOneSection(id: string, schoolId: string): Promise<Section> {
        const section = await this.sectionRepository
            .createQueryBuilder('section')
            .innerJoin('section.class', 'class')
            .where('section.id = :id', { id })
            .andWhere('class.school_id = :schoolId', { schoolId })
            .getOne();

        if (!section) {
            throw new NotFoundException(`Section with ID ${id} not found`);
        }

        return section;
    }

    async updateSection(
        id: string,
        updateDto: UpdateSectionDto,
        schoolId: string,
    ): Promise<Section> {
        const section = await this.findOneSection(id, schoolId);

        // Check for duplicate name if updating
        if (updateDto.name && updateDto.name !== section.name) {
            const existing = await this.sectionRepository.findOne({
                where: {
                    classId: section.classId,
                    name: updateDto.name,
                },
            });

            if (existing) {
                throw new ConflictException(
                    `Section ${updateDto.name} already exists in this class`,
                );
            }
        }

        Object.assign(section, updateDto);
        return this.sectionRepository.save(section);
    }

    async removeSection(id: string, schoolId: string): Promise<void> {
        const section = await this.findOneSection(id, schoolId);
        await this.sectionRepository.remove(section);
    }

    /**
     * Get sections by class ID (for dropdowns).
     */
    async getSectionsByClass(
        classId: string,
        schoolId: string,
    ): Promise<Section[]> {
        // Verify class belongs to school
        await this.findOneClass(classId, schoolId);

        return this.sectionRepository.find({
            where: { classId },
            order: { name: 'ASC' },
        });
    }
}
