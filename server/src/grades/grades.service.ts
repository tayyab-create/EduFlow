import {
    Injectable,
    NotFoundException,
    ConflictException,
    BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GradingScale, GradeDefinition } from './entities/grading-scale.entity';
import { Assessment } from './entities/assessment.entity';
import { Grade } from './entities/grade.entity';
import {
    CreateGradingScaleDto,
    CreateAssessmentDto,
    CreateGradeDto,
    BulkGradeDto,
    UpdateGradingScaleDto,
    UpdateAssessmentDto,
    UpdateGradeDto,
    QueryAssessmentsDto,
    QueryGradesDto,
} from './dto';
import {
    PaginatedResponse,
    createPaginatedResponse,
} from '../common/dto/pagination.dto';

@Injectable()
export class GradesService {
    constructor(
        @InjectRepository(GradingScale)
        private readonly gradingScaleRepository: Repository<GradingScale>,
        @InjectRepository(Assessment)
        private readonly assessmentRepository: Repository<Assessment>,
        @InjectRepository(Grade)
        private readonly gradeRepository: Repository<Grade>,
    ) { }

    // ==================== GRADING SCALE METHODS ====================

    async createGradingScale(
        dto: CreateGradingScaleDto,
        schoolId: string,
    ): Promise<GradingScale> {
        // Check for duplicate name
        const existing = await this.gradingScaleRepository.findOne({
            where: { schoolId, name: dto.name },
        });

        if (existing) {
            throw new ConflictException(`Grading scale ${dto.name} already exists`);
        }

        // If setting as default, unset other defaults
        if (dto.isDefault) {
            await this.gradingScaleRepository.update(
                { schoolId, isDefault: true },
                { isDefault: false },
            );
        }

        const scale = this.gradingScaleRepository.create({
            ...dto,
            schoolId,
        });

        return this.gradingScaleRepository.save(scale);
    }

    async findAllGradingScales(schoolId: string): Promise<GradingScale[]> {
        return this.gradingScaleRepository.find({
            where: { schoolId, isActive: true },
            order: { name: 'ASC' },
        });
    }

    async findDefaultGradingScale(schoolId: string): Promise<GradingScale | null> {
        return this.gradingScaleRepository.findOne({
            where: { schoolId, isDefault: true, isActive: true },
        });
    }

    // ==================== ASSESSMENT METHODS ====================

    async createAssessment(
        dto: CreateAssessmentDto,
        createdBy: string,
        schoolId: string,
    ): Promise<Assessment> {
        const assessment = this.assessmentRepository.create({
            ...dto,
            assessmentDate: new Date(dto.assessmentDate),
            dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
            createdBy,
        });

        return this.assessmentRepository.save(assessment);
    }

    async findAllAssessments(
        query: QueryAssessmentsDto,
        schoolId: string,
    ): Promise<PaginatedResponse<Assessment>> {
        const queryBuilder = this.assessmentRepository
            .createQueryBuilder('assessment')
            .innerJoin('assessment.section', 'section')
            .innerJoin('section.class', 'class')
            .where('class.school_id = :schoolId', { schoolId })
            .andWhere('assessment.deleted_at IS NULL');

        if (query.sectionId) {
            queryBuilder.andWhere('assessment.section_id = :sectionId', {
                sectionId: query.sectionId,
            });
        }

        if (query.subjectId) {
            queryBuilder.andWhere('assessment.subject_id = :subjectId', {
                subjectId: query.subjectId,
            });
        }

        if (query.termId) {
            queryBuilder.andWhere('assessment.term_id = :termId', {
                termId: query.termId,
            });
        }

        if (query.type) {
            queryBuilder.andWhere('assessment.type = :type', { type: query.type });
        }

        if (query.isGraded !== undefined) {
            queryBuilder.andWhere('assessment.is_graded = :isGraded', {
                isGraded: query.isGraded,
            });
        }

        if (query.isPublished !== undefined) {
            queryBuilder.andWhere('assessment.is_published = :isPublished', {
                isPublished: query.isPublished,
            });
        }

        queryBuilder.orderBy('assessment.assessment_date', 'DESC');

        const total = await queryBuilder.getCount();
        queryBuilder.skip(query.skip).take(query.take);

        const assessments = await queryBuilder.getMany();
        return createPaginatedResponse(assessments, total, query);
    }

    async findOneAssessment(id: string, schoolId: string): Promise<Assessment> {
        const assessment = await this.assessmentRepository
            .createQueryBuilder('assessment')
            .innerJoin('assessment.section', 'section')
            .innerJoin('section.class', 'class')
            .leftJoinAndSelect('assessment.subject', 'subject')
            .leftJoinAndSelect('assessment.term', 'term')
            .where('assessment.id = :id', { id })
            .andWhere('class.school_id = :schoolId', { schoolId })
            .andWhere('assessment.deleted_at IS NULL')
            .getOne();

        if (!assessment) {
            throw new NotFoundException(`Assessment with ID ${id} not found`);
        }

        return assessment;
    }

    async updateAssessment(
        id: string,
        dto: UpdateAssessmentDto,
        schoolId: string,
    ): Promise<Assessment> {
        const assessment = await this.findOneAssessment(id, schoolId);
        Object.assign(assessment, dto);

        if (dto.assessmentDate) {
            assessment.assessmentDate = new Date(dto.assessmentDate);
        }
        if (dto.dueDate) {
            assessment.dueDate = new Date(dto.dueDate);
        }

        return this.assessmentRepository.save(assessment);
    }

    async publishAssessment(id: string, schoolId: string): Promise<Assessment> {
        const assessment = await this.findOneAssessment(id, schoolId);
        assessment.isPublished = true;
        assessment.publishedAt = new Date();
        return this.assessmentRepository.save(assessment);
    }

    async removeAssessment(id: string, schoolId: string): Promise<void> {
        const assessment = await this.findOneAssessment(id, schoolId);
        await this.assessmentRepository.softRemove(assessment);
    }

    // ==================== GRADE METHODS ====================

    async enterGrade(dto: CreateGradeDto, gradedBy: string): Promise<Grade> {
        // Check for existing grade
        const existing = await this.gradeRepository.findOne({
            where: { assessmentId: dto.assessmentId, studentId: dto.studentId },
        });

        if (existing) {
            throw new ConflictException('Grade already exists for this student');
        }

        const grade = this.gradeRepository.create({
            ...dto,
            gradedBy,
            gradedAt: new Date(),
        });

        // Calculate percentage if marks provided
        if (dto.marksObtained !== undefined) {
            const assessment = await this.assessmentRepository.findOne({
                where: { id: dto.assessmentId },
            });
            if (assessment) {
                grade.percentage = (dto.marksObtained / Number(assessment.totalMarks)) * 100;
            }
        }

        return this.gradeRepository.save(grade);
    }

    async bulkEnterGrades(
        dto: BulkGradeDto,
        gradedBy: string,
        schoolId: string,
    ): Promise<{ created: number; updated: number }> {
        const assessment = await this.assessmentRepository.findOne({
            where: { id: dto.assessmentId },
        });

        if (!assessment) {
            throw new NotFoundException('Assessment not found');
        }

        let created = 0;
        let updated = 0;

        for (const entry of dto.grades) {
            const existing = await this.gradeRepository.findOne({
                where: { assessmentId: dto.assessmentId, studentId: entry.studentId },
            });

            const percentage = entry.marksObtained !== undefined
                ? (entry.marksObtained / Number(assessment.totalMarks)) * 100
                : undefined;

            if (existing) {
                Object.assign(existing, entry, { percentage, gradedAt: new Date() });
                await this.gradeRepository.save(existing);
                updated++;
            } else {
                const grade = this.gradeRepository.create({
                    assessmentId: dto.assessmentId,
                    ...entry,
                    percentage,
                    gradedBy,
                    gradedAt: new Date(),
                });
                await this.gradeRepository.save(grade);
                created++;
            }
        }

        // Mark assessment as graded if all students have grades
        assessment.isGraded = true;
        await this.assessmentRepository.save(assessment);

        return { created, updated };
    }

    async findGradesByAssessment(assessmentId: string): Promise<Grade[]> {
        return this.gradeRepository.find({
            where: { assessmentId },
            relations: ['student'],
            order: { createdAt: 'ASC' },
        });
    }

    async findGradesByStudent(
        studentId: string,
        termId?: string,
    ): Promise<Grade[]> {
        const queryBuilder = this.gradeRepository
            .createQueryBuilder('grade')
            .innerJoinAndSelect('grade.assessment', 'assessment')
            .where('grade.student_id = :studentId', { studentId });

        if (termId) {
            queryBuilder.andWhere('assessment.term_id = :termId', { termId });
        }

        return queryBuilder.orderBy('assessment.assessment_date', 'DESC').getMany();
    }

    async updateGrade(
        id: string,
        dto: UpdateGradeDto,
        gradedBy: string,
    ): Promise<Grade> {
        const grade = await this.gradeRepository.findOne({ where: { id } });

        if (!grade) {
            throw new NotFoundException(`Grade with ID ${id} not found`);
        }

        Object.assign(grade, dto, { gradedBy, gradedAt: new Date() });

        // Recalculate percentage if marks updated
        if (dto.marksObtained !== undefined) {
            const assessment = await this.assessmentRepository.findOne({
                where: { id: grade.assessmentId },
            });
            if (assessment) {
                grade.percentage = (dto.marksObtained / Number(assessment.totalMarks)) * 100;
            }
        }

        return this.gradeRepository.save(grade);
    }
}
