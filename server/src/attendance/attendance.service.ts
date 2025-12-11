import {
    Injectable,
    NotFoundException,
    ConflictException,
    BadRequestException,
    ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, In } from 'typeorm';
import { Attendance, AttendanceStatus } from './entities/attendance.entity';
import { Student, StudentStatus } from '../students/entities/student.entity';
import {
    CreateAttendanceDto,
    BulkAttendanceDto,
    QuickBulkAttendanceDto,
    UpdateAttendanceDto,
    CorrectAttendanceDto,
    QueryAttendanceDto,
    AttendanceReportDto,
} from './dto';
import {
    PaginatedResponse,
    createPaginatedResponse,
} from '../common/dto/pagination.dto';

/**
 * Attendance statistics for a section.
 */
export interface AttendanceStats {
    totalStudents: number;
    present: number;
    absent: number;
    late: number;
    leave: number;
    attendanceRate: number; // percentage
}

/**
 * Student attendance summary for reports.
 */
export interface StudentAttendanceSummary {
    studentId: string;
    studentName: string;
    totalDays: number;
    presentDays: number;
    absentDays: number;
    lateDays: number;
    leaveDays: number;
    attendancePercentage: number;
}

@Injectable()
export class AttendanceService {
    constructor(
        @InjectRepository(Attendance)
        private readonly attendanceRepository: Repository<Attendance>,
        @InjectRepository(Student)
        private readonly studentRepository: Repository<Student>,
    ) { }

    /**
     * Mark attendance for a single student.
     */
    async create(
        dto: CreateAttendanceDto,
        markedBy: string,
    ): Promise<Attendance> {
        // Check for existing attendance on same date
        const existing = await this.attendanceRepository.findOne({
            where: {
                studentId: dto.studentId,
                date: new Date(dto.date),
            },
        });

        if (existing) {
            throw new ConflictException(
                'Attendance already marked for this student on this date',
            );
        }

        const attendance = this.attendanceRepository.create({
            ...dto,
            date: new Date(dto.date),
            markedBy,
            markedAt: new Date(),
        });

        return this.attendanceRepository.save(attendance);
    }

    /**
     * Bulk mark attendance for a section.
     * This is the primary use case for teachers.
     */
    async bulkMark(
        dto: BulkAttendanceDto,
        markedBy: string,
        schoolId: string,
    ): Promise<{ created: number; updated: number }> {
        const date = new Date(dto.date);
        let created = 0;
        let updated = 0;

        for (const record of dto.attendanceRecords) {
            // Check for existing
            const existing = await this.attendanceRepository.findOne({
                where: {
                    studentId: record.studentId,
                    date,
                },
            });

            if (existing) {
                // Update existing
                Object.assign(existing, {
                    status: record.status,
                    lateMinutes: record.lateMinutes || 0,
                    notes: record.notes,
                    checkInTime: record.checkInTime,
                    updatedAt: new Date(),
                });
                await this.attendanceRepository.save(existing);
                updated++;
            } else {
                // Create new
                const attendance = this.attendanceRepository.create({
                    studentId: record.studentId,
                    sectionId: dto.sectionId,
                    date,
                    status: record.status,
                    lateMinutes: record.lateMinutes || 0,
                    notes: record.notes,
                    checkInTime: record.checkInTime,
                    markedBy,
                    markedAt: new Date(),
                    clientId: dto.clientId,
                });
                await this.attendanceRepository.save(attendance);
                created++;
            }
        }

        return { created, updated };
    }

    /**
     * Quick bulk marking - mark all present except specified absentees.
     * Enables the "Mark All Present" -> "Tap Exceptions" flow.
     */
    async quickBulkMark(
        dto: QuickBulkAttendanceDto,
        markedBy: string,
        schoolId: string,
    ): Promise<{ created: number; updated: number }> {
        // Get all students in the section
        const students = await this.studentRepository.find({
            where: { sectionId: dto.sectionId, status: StudentStatus.ACTIVE },
            select: ['id'],
        });

        if (students.length === 0) {
            throw new BadRequestException('No students found in this section');
        }

        const date = new Date(dto.date);
        const absentSet = new Set(dto.absentStudentIds || []);
        const lateSet = new Set(dto.lateStudentIds || []);

        let created = 0;
        let updated = 0;

        for (const student of students) {
            let status = AttendanceStatus.PRESENT;

            if (absentSet.has(student.id)) {
                status = AttendanceStatus.ABSENT;
            } else if (lateSet.has(student.id)) {
                status = AttendanceStatus.LATE;
            }

            // Check for existing
            const existing = await this.attendanceRepository.findOne({
                where: { studentId: student.id, date },
            });

            if (existing) {
                existing.status = status;
                existing.updatedAt = new Date();
                await this.attendanceRepository.save(existing);
                updated++;
            } else {
                const attendance = this.attendanceRepository.create({
                    studentId: student.id,
                    sectionId: dto.sectionId,
                    date,
                    status,
                    markedBy,
                    markedAt: new Date(),
                    clientId: dto.clientId,
                });
                await this.attendanceRepository.save(attendance);
                created++;
            }
        }

        return { created, updated };
    }

    /**
     * Find all attendance records with filters.
     */
    async findAll(
        query: QueryAttendanceDto,
        schoolId: string,
    ): Promise<PaginatedResponse<Attendance>> {
        const queryBuilder = this.attendanceRepository
            .createQueryBuilder('attendance')
            .innerJoin('attendance.student', 'student')
            .where('student.school_id = :schoolId', { schoolId });

        if (query.sectionId) {
            queryBuilder.andWhere('attendance.section_id = :sectionId', {
                sectionId: query.sectionId,
            });
        }

        if (query.studentId) {
            queryBuilder.andWhere('attendance.student_id = :studentId', {
                studentId: query.studentId,
            });
        }

        if (query.date) {
            queryBuilder.andWhere('attendance.date = :date', {
                date: new Date(query.date),
            });
        }

        if (query.startDate && query.endDate) {
            queryBuilder.andWhere('attendance.date BETWEEN :startDate AND :endDate', {
                startDate: new Date(query.startDate),
                endDate: new Date(query.endDate),
            });
        }

        if (query.status) {
            queryBuilder.andWhere('attendance.status = :status', {
                status: query.status,
            });
        }

        queryBuilder.orderBy('attendance.date', 'DESC');

        const total = await queryBuilder.getCount();
        queryBuilder.skip(query.skip).take(query.take);

        const records = await queryBuilder.getMany();
        return createPaginatedResponse(records, total, query);
    }

    /**
     * Get attendance for a specific date and section.
     */
    async getByDateAndSection(
        sectionId: string,
        date: string,
        schoolId: string,
    ): Promise<Attendance[]> {
        return this.attendanceRepository
            .createQueryBuilder('attendance')
            .innerJoinAndSelect('attendance.student', 'student')
            .where('attendance.section_id = :sectionId', { sectionId })
            .andWhere('attendance.date = :date', { date: new Date(date) })
            .andWhere('student.school_id = :schoolId', { schoolId })
            .orderBy('student.first_name', 'ASC')
            .getMany();
    }

    /**
     * Get single attendance record.
     */
    async findOne(id: string, schoolId: string): Promise<Attendance> {
        const attendance = await this.attendanceRepository
            .createQueryBuilder('attendance')
            .innerJoin('attendance.student', 'student')
            .where('attendance.id = :id', { id })
            .andWhere('student.school_id = :schoolId', { schoolId })
            .getOne();

        if (!attendance) {
            throw new NotFoundException(`Attendance record with ID ${id} not found`);
        }

        return attendance;
    }

    /**
     * Update attendance record.
     */
    async update(
        id: string,
        dto: UpdateAttendanceDto,
        schoolId: string,
    ): Promise<Attendance> {
        const attendance = await this.findOne(id, schoolId);
        Object.assign(attendance, dto);
        return this.attendanceRepository.save(attendance);
    }

    /**
     * Correct attendance with audit trail.
     */
    async correct(
        id: string,
        dto: CorrectAttendanceDto,
        correctedBy: string,
        schoolId: string,
    ): Promise<Attendance> {
        const attendance = await this.findOne(id, schoolId);

        // Store original status for audit
        attendance.originalStatus = attendance.status;
        attendance.status = dto.status;
        attendance.correctionReason = dto.correctionReason;
        attendance.correctedBy = correctedBy;
        attendance.correctedAt = new Date();
        attendance.isCorrected = true;

        if (dto.notes) {
            attendance.notes = dto.notes;
        }

        return this.attendanceRepository.save(attendance);
    }

    /**
     * Delete attendance record.
     */
    async remove(id: string, schoolId: string): Promise<void> {
        const attendance = await this.findOne(id, schoolId);
        await this.attendanceRepository.remove(attendance);
    }

    /**
     * Get attendance statistics for a section on a specific date.
     */
    async getSectionStats(
        sectionId: string,
        date: string,
        schoolId: string,
    ): Promise<AttendanceStats> {
        const records = await this.getByDateAndSection(sectionId, date, schoolId);

        const stats: AttendanceStats = {
            totalStudents: records.length,
            present: 0,
            absent: 0,
            late: 0,
            leave: 0,
            attendanceRate: 0,
        };

        for (const record of records) {
            switch (record.status) {
                case AttendanceStatus.PRESENT:
                    stats.present++;
                    break;
                case AttendanceStatus.ABSENT:
                    stats.absent++;
                    break;
                case AttendanceStatus.LATE:
                    stats.late++;
                    break;
                case AttendanceStatus.SICK_LEAVE:
                case AttendanceStatus.APPROVED_LEAVE:
                    stats.leave++;
                    break;
            }
        }

        if (stats.totalStudents > 0) {
            stats.attendanceRate = Math.round(
                ((stats.present + stats.late) / stats.totalStudents) * 100,
            );
        }

        return stats;
    }

    /**
     * Get student attendance summary for a date range.
     */
    async getStudentSummary(
        studentId: string,
        startDate: string,
        endDate: string,
        schoolId: string,
    ): Promise<StudentAttendanceSummary> {
        const student = await this.studentRepository.findOne({
            where: { id: studentId, schoolId },
        });

        if (!student) {
            throw new NotFoundException(`Student with ID ${studentId} not found`);
        }

        const records = await this.attendanceRepository.find({
            where: {
                studentId,
                date: Between(new Date(startDate), new Date(endDate)),
            },
        });

        const summary: StudentAttendanceSummary = {
            studentId,
            studentName: `${student.firstName} ${student.lastName}`,
            totalDays: records.length,
            presentDays: 0,
            absentDays: 0,
            lateDays: 0,
            leaveDays: 0,
            attendancePercentage: 0,
        };

        for (const record of records) {
            switch (record.status) {
                case AttendanceStatus.PRESENT:
                    summary.presentDays++;
                    break;
                case AttendanceStatus.ABSENT:
                    summary.absentDays++;
                    break;
                case AttendanceStatus.LATE:
                    summary.lateDays++;
                    break;
                case AttendanceStatus.SICK_LEAVE:
                case AttendanceStatus.APPROVED_LEAVE:
                    summary.leaveDays++;
                    break;
            }
        }

        if (summary.totalDays > 0) {
            summary.attendancePercentage = Math.round(
                ((summary.presentDays + summary.lateDays) / summary.totalDays) * 100,
            );
        }

        return summary;
    }

    /**
     * Check if attendance is already marked for a section on a date.
     */
    async isMarked(sectionId: string, date: string): Promise<boolean> {
        const count = await this.attendanceRepository.count({
            where: {
                sectionId,
                date: new Date(date),
            },
        });
        return count > 0;
    }
}
