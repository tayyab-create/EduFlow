import {
    Injectable,
    NotFoundException,
    ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subject, ClassSubject } from './entities';
import {
    CreateSubjectDto,
    UpdateSubjectDto,
    CreateClassSubjectDto,
    QuerySubjectsDto,
} from './dto';
import {
    PaginatedResponse,
    createPaginatedResponse,
} from '../common/dto/pagination.dto';

@Injectable()
export class SubjectsService {
    constructor(
        @InjectRepository(Subject)
        private readonly subjectRepository: Repository<Subject>,
        @InjectRepository(ClassSubject)
        private readonly classSubjectRepository: Repository<ClassSubject>,
    ) { }

    // ==================== SUBJECT METHODS ====================

    async create(
        createDto: CreateSubjectDto,
        schoolId: string,
    ): Promise<Subject> {
        // Check for duplicate code
        if (createDto.code) {
            const existing = await this.subjectRepository.findOne({
                where: { schoolId, code: createDto.code },
            });
            if (existing) {
                throw new ConflictException(
                    `Subject with code ${createDto.code} already exists`,
                );
            }
        }

        const subject = this.subjectRepository.create({
            ...createDto,
            schoolId,
        });

        return this.subjectRepository.save(subject);
    }

    async findAll(
        query: QuerySubjectsDto,
        schoolId: string,
    ): Promise<PaginatedResponse<Subject>> {
        const queryBuilder = this.subjectRepository
            .createQueryBuilder('subject')
            .where('subject.school_id = :schoolId', { schoolId });

        if (query.isActive !== undefined) {
            queryBuilder.andWhere('subject.is_active = :isActive', {
                isActive: query.isActive,
            });
        }

        if (query.isMandatory !== undefined) {
            queryBuilder.andWhere('subject.is_mandatory = :isMandatory', {
                isMandatory: query.isMandatory,
            });
        }

        queryBuilder.orderBy('subject.name', 'ASC');

        const total = await queryBuilder.getCount();
        queryBuilder.skip(query.skip).take(query.take);

        const subjects = await queryBuilder.getMany();
        return createPaginatedResponse(subjects, total, query);
    }

    async findOne(id: string, schoolId: string): Promise<Subject> {
        const subject = await this.subjectRepository.findOne({
            where: { id, schoolId },
        });

        if (!subject) {
            throw new NotFoundException(`Subject with ID ${id} not found`);
        }

        return subject;
    }

    async update(
        id: string,
        updateDto: UpdateSubjectDto,
        schoolId: string,
    ): Promise<Subject> {
        const subject = await this.findOne(id, schoolId);

        if (updateDto.code && updateDto.code !== subject.code) {
            const existing = await this.subjectRepository.findOne({
                where: { schoolId, code: updateDto.code },
            });
            if (existing) {
                throw new ConflictException(
                    `Subject with code ${updateDto.code} already exists`,
                );
            }
        }

        Object.assign(subject, updateDto);
        return this.subjectRepository.save(subject);
    }

    async remove(id: string, schoolId: string): Promise<void> {
        const subject = await this.findOne(id, schoolId);
        await this.subjectRepository.remove(subject);
    }

    // ==================== CLASS-SUBJECT METHODS ====================

    async assignToClass(
        createDto: CreateClassSubjectDto,
        schoolId: string,
    ): Promise<ClassSubject> {
        // Check for duplicate assignment
        const existing = await this.classSubjectRepository.findOne({
            where: {
                classId: createDto.classId,
                subjectId: createDto.subjectId,
            },
        });

        if (existing) {
            throw new ConflictException(
                'This subject is already assigned to this class',
            );
        }

        const classSubject = this.classSubjectRepository.create(createDto);
        return this.classSubjectRepository.save(classSubject);
    }

    async getClassSubjects(classId: string): Promise<ClassSubject[]> {
        return this.classSubjectRepository.find({
            where: { classId },
            relations: ['subject', 'teacher'],
        });
    }

    async removeClassSubject(id: string): Promise<void> {
        const classSubject = await this.classSubjectRepository.findOne({
            where: { id },
        });

        if (!classSubject) {
            throw new NotFoundException(`Class subject assignment not found`);
        }

        await this.classSubjectRepository.remove(classSubject);
    }
}
