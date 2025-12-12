import {
    Injectable,
    NotFoundException,
    ConflictException,
    BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Period, DayOfWeek, TimetableEntry } from './entities';
import {
    CreatePeriodDto,
    UpdatePeriodDto,
    CreateTimetableEntryDto,
    UpdateTimetableEntryDto,
    QueryScheduleDto,
    QueryPeriodsDto,
} from './dto';
import {
    PaginatedResponse,
    createPaginatedResponse,
} from '../common/dto/pagination.dto';

/**
 * Interface for schedule view response.
 */
export interface ScheduleEntry {
    periodId: string;
    periodName: string;
    startTime: string;
    endTime: string;
    dayOfWeek: DayOfWeek;
    order: number;
    isBreak: boolean;
    subject?: {
        id: string;
        name: string;
        code: string | null;
    };
    teacher?: {
        id: string;
        firstName: string;
        lastName: string;
    };
    section?: {
        id: string;
        name: string;
        className: string;
    };
    room: string | null;
}

/**
 * Interface for conflict check result.
 */
export interface ConflictResult {
    hasConflict: boolean;
    conflictType?: 'teacher' | 'section';
    existingEntry?: TimetableEntry;
    message?: string;
}

/**
 * Service for managing timetable periods and entries.
 * Provides schedule views for teachers and sections.
 */
@Injectable()
export class TimetableService {
    constructor(
        @InjectRepository(Period)
        private readonly periodRepository: Repository<Period>,
        @InjectRepository(TimetableEntry)
        private readonly entryRepository: Repository<TimetableEntry>,
    ) { }

    // ==================== PERIOD METHODS ====================

    /**
     * Create a new period for a school.
     */
    async createPeriod(
        dto: CreatePeriodDto,
        schoolId: string,
    ): Promise<Period> {
        // Validate start time is before end time
        if (dto.startTime >= dto.endTime) {
            throw new BadRequestException('Start time must be before end time');
        }

        // Check for duplicate order on same day
        const existing = await this.periodRepository.findOne({
            where: {
                schoolId,
                dayOfWeek: dto.dayOfWeek,
                order: dto.order,
            },
        });

        if (existing) {
            throw new ConflictException(
                `Period with order ${dto.order} already exists for ${dto.dayOfWeek}`,
            );
        }

        // Calculate duration if not provided
        const durationMinutes =
            dto.durationMinutes ?? this.calculateDurationMinutes(dto.startTime, dto.endTime);

        const period = this.periodRepository.create({
            ...dto,
            schoolId,
            durationMinutes,
            isBreak: dto.isBreak ?? false,
        });

        return this.periodRepository.save(period);
    }

    /**
     * Find all periods for a school.
     */
    async findAllPeriods(
        query: QueryPeriodsDto,
        schoolId: string,
    ): Promise<PaginatedResponse<Period>> {
        const queryBuilder = this.periodRepository
            .createQueryBuilder('period')
            .where('period.school_id = :schoolId', { schoolId })
            .andWhere('period.is_active = true');

        if (query.dayOfWeek) {
            queryBuilder.andWhere('period.day_of_week = :dayOfWeek', {
                dayOfWeek: query.dayOfWeek,
            });
        }

        queryBuilder
            .orderBy('period.day_of_week', 'ASC')
            .addOrderBy('period.order', 'ASC');

        const total = await queryBuilder.getCount();
        queryBuilder.skip(query.skip).take(query.take);

        const periods = await queryBuilder.getMany();
        return createPaginatedResponse(periods, total, query);
    }

    /**
     * Get periods for a specific day.
     */
    async getPeriodsByDay(
        schoolId: string,
        dayOfWeek: DayOfWeek,
    ): Promise<Period[]> {
        return this.periodRepository.find({
            where: { schoolId, dayOfWeek, isActive: true },
            order: { order: 'ASC' },
        });
    }

    /**
     * Update a period.
     */
    async updatePeriod(
        id: string,
        dto: UpdatePeriodDto,
        schoolId: string,
    ): Promise<Period> {
        const period = await this.periodRepository.findOne({
            where: { id, schoolId },
        });

        if (!period) {
            throw new NotFoundException(`Period with ID ${id} not found`);
        }

        // Validate times if updating
        const startTime = dto.startTime ?? period.startTime;
        const endTime = dto.endTime ?? period.endTime;
        if (startTime >= endTime) {
            throw new BadRequestException('Start time must be before end time');
        }

        Object.assign(period, dto);

        // Recalculate duration if times changed
        if (dto.startTime || dto.endTime) {
            period.durationMinutes = this.calculateDurationMinutes(
                period.startTime,
                period.endTime,
            );
        }

        return this.periodRepository.save(period);
    }

    /**
     * Delete a period.
     */
    async removePeriod(id: string, schoolId: string): Promise<void> {
        const period = await this.periodRepository.findOne({
            where: { id, schoolId },
        });

        if (!period) {
            throw new NotFoundException(`Period with ID ${id} not found`);
        }

        await this.periodRepository.remove(period);
    }

    // ==================== TIMETABLE ENTRY METHODS ====================

    /**
     * Create a timetable entry (assign subject/teacher to period).
     */
    async createEntry(
        dto: CreateTimetableEntryDto,
        schoolId: string,
    ): Promise<TimetableEntry> {
        // Check for conflicts first
        const conflict = await this.checkConflicts(dto, schoolId);
        if (conflict.hasConflict) {
            throw new ConflictException(conflict.message);
        }

        const entry = this.entryRepository.create({
            ...dto,
            room: dto.room ?? null,
            notes: dto.notes ?? null,
        });

        return this.entryRepository.save(entry);
    }

    /**
     * Check for scheduling conflicts.
     */
    async checkConflicts(
        dto: CreateTimetableEntryDto,
        schoolId: string,
        excludeEntryId?: string,
    ): Promise<ConflictResult> {
        // Check if section already has entry for this period
        const sectionConflictQuery = this.entryRepository
            .createQueryBuilder('entry')
            .where('entry.period_id = :periodId', { periodId: dto.periodId })
            .andWhere('entry.section_id = :sectionId', { sectionId: dto.sectionId })
            .andWhere('entry.academic_year_id = :academicYearId', {
                academicYearId: dto.academicYearId,
            })
            .andWhere('entry.is_active = true');

        if (excludeEntryId) {
            sectionConflictQuery.andWhere('entry.id != :excludeId', {
                excludeId: excludeEntryId,
            });
        }

        const sectionConflict = await sectionConflictQuery.getOne();
        if (sectionConflict) {
            return {
                hasConflict: true,
                conflictType: 'section',
                existingEntry: sectionConflict,
                message: 'Section already has a class scheduled for this period',
            };
        }

        // Check if teacher is already assigned to another section at this time
        const teacherConflictQuery = this.entryRepository
            .createQueryBuilder('entry')
            .innerJoin('entry.period', 'period')
            .where('entry.period_id = :periodId', { periodId: dto.periodId })
            .andWhere('entry.teacher_id = :teacherId', { teacherId: dto.teacherId })
            .andWhere('entry.academic_year_id = :academicYearId', {
                academicYearId: dto.academicYearId,
            })
            .andWhere('entry.is_active = true')
            .andWhere('period.school_id = :schoolId', { schoolId });

        if (excludeEntryId) {
            teacherConflictQuery.andWhere('entry.id != :excludeId', {
                excludeId: excludeEntryId,
            });
        }

        const teacherConflict = await teacherConflictQuery.getOne();
        if (teacherConflict) {
            return {
                hasConflict: true,
                conflictType: 'teacher',
                existingEntry: teacherConflict,
                message: 'Teacher is already assigned to another class at this time',
            };
        }

        return { hasConflict: false };
    }

    /**
     * Update a timetable entry.
     */
    async updateEntry(
        id: string,
        dto: UpdateTimetableEntryDto,
    ): Promise<TimetableEntry> {
        const entry = await this.entryRepository.findOne({
            where: { id },
            relations: ['period'],
        });

        if (!entry) {
            throw new NotFoundException(`Timetable entry with ID ${id} not found`);
        }

        // If changing period, teacher, or section, check for conflicts
        if (dto.periodId || dto.teacherId || dto.sectionId || dto.academicYearId) {
            const checkDto: CreateTimetableEntryDto = {
                periodId: dto.periodId ?? entry.periodId,
                sectionId: dto.sectionId ?? entry.sectionId,
                subjectId: dto.subjectId ?? entry.subjectId,
                teacherId: dto.teacherId ?? entry.teacherId,
                academicYearId: dto.academicYearId ?? entry.academicYearId,
            };

            const conflict = await this.checkConflicts(
                checkDto,
                entry.period.schoolId,
                id,
            );
            if (conflict.hasConflict) {
                throw new ConflictException(conflict.message);
            }
        }

        Object.assign(entry, dto);
        return this.entryRepository.save(entry);
    }

    /**
     * Delete a timetable entry.
     */
    async removeEntry(id: string): Promise<void> {
        const entry = await this.entryRepository.findOne({ where: { id } });
        if (!entry) {
            throw new NotFoundException(`Timetable entry with ID ${id} not found`);
        }
        await this.entryRepository.remove(entry);
    }

    // ==================== SCHEDULE VIEW METHODS ====================

    /**
     * Get schedule for a teacher.
     */
    async getTeacherSchedule(
        teacherId: string,
        query: QueryScheduleDto,
        schoolId: string,
    ): Promise<ScheduleEntry[]> {
        const queryBuilder = this.entryRepository
            .createQueryBuilder('entry')
            .innerJoinAndSelect('entry.period', 'period')
            .innerJoinAndSelect('entry.subject', 'subject')
            .innerJoinAndSelect('entry.section', 'section')
            .innerJoin('section.class', 'class')
            .where('entry.teacher_id = :teacherId', { teacherId })
            .andWhere('period.school_id = :schoolId', { schoolId })
            .andWhere('entry.is_active = true')
            .andWhere('period.is_active = true');

        if (query.dayOfWeek) {
            queryBuilder.andWhere('period.day_of_week = :dayOfWeek', {
                dayOfWeek: query.dayOfWeek,
            });
        }

        if (query.academicYearId) {
            queryBuilder.andWhere('entry.academic_year_id = :academicYearId', {
                academicYearId: query.academicYearId,
            });
        }

        queryBuilder
            .orderBy('period.day_of_week', 'ASC')
            .addOrderBy('period.order', 'ASC');

        const entries = await queryBuilder.getMany();

        return entries.map((entry) => this.mapToScheduleEntry(entry, 'teacher'));
    }

    /**
     * Get schedule for a section.
     */
    async getSectionSchedule(
        sectionId: string,
        query: QueryScheduleDto,
        schoolId: string,
    ): Promise<ScheduleEntry[]> {
        const queryBuilder = this.entryRepository
            .createQueryBuilder('entry')
            .innerJoinAndSelect('entry.period', 'period')
            .innerJoinAndSelect('entry.subject', 'subject')
            .innerJoinAndSelect('entry.teacher', 'teacher')
            .where('entry.section_id = :sectionId', { sectionId })
            .andWhere('period.school_id = :schoolId', { schoolId })
            .andWhere('entry.is_active = true')
            .andWhere('period.is_active = true');

        if (query.dayOfWeek) {
            queryBuilder.andWhere('period.day_of_week = :dayOfWeek', {
                dayOfWeek: query.dayOfWeek,
            });
        }

        if (query.academicYearId) {
            queryBuilder.andWhere('entry.academic_year_id = :academicYearId', {
                academicYearId: query.academicYearId,
            });
        }

        queryBuilder
            .orderBy('period.day_of_week', 'ASC')
            .addOrderBy('period.order', 'ASC');

        const entries = await queryBuilder.getMany();

        return entries.map((entry) => this.mapToScheduleEntry(entry, 'section'));
    }

    // ==================== HELPER METHODS ====================

    /**
     * Calculate duration in minutes from start and end time strings.
     */
    private calculateDurationMinutes(startTime: string, endTime: string): number {
        const [startHour, startMin] = startTime.split(':').map(Number);
        const [endHour, endMin] = endTime.split(':').map(Number);

        const startMinutes = startHour * 60 + startMin;
        const endMinutes = endHour * 60 + endMin;

        return endMinutes - startMinutes;
    }

    /**
     * Map timetable entry to schedule view format.
     */
    private mapToScheduleEntry(
        entry: TimetableEntry,
        viewType: 'teacher' | 'section',
    ): ScheduleEntry {
        const result: ScheduleEntry = {
            periodId: entry.period.id,
            periodName: entry.period.name,
            startTime: entry.period.startTime,
            endTime: entry.period.endTime,
            dayOfWeek: entry.period.dayOfWeek,
            order: entry.period.order,
            isBreak: entry.period.isBreak,
            room: entry.room,
        };

        if (entry.subject) {
            result.subject = {
                id: entry.subject.id,
                name: entry.subject.name,
                code: entry.subject.code ?? null,
            };
        }

        if (viewType === 'section' && entry.teacher) {
            result.teacher = {
                id: entry.teacher.id,
                firstName: entry.teacher.firstName,
                lastName: entry.teacher.lastName,
            };
        }

        if (viewType === 'teacher' && entry.section) {
            result.section = {
                id: entry.section.id,
                name: entry.section.name,
                className: entry.section.classId, // Will be populated from join
            };
        }

        return result;
    }
}
