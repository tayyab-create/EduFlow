import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Attendance, AttendanceStatus } from '../attendance/entities/attendance.entity';
import { StudentFee, StudentFeeStatus } from '../fees/entities/student-fee.entity';
import { Payment } from '../fees/entities/payment.entity';
import { Grade } from '../grades/entities/grade.entity';
import { Student } from '../students/entities/student.entity';

/**
 * Interface for attendance summary report.
 */
export interface AttendanceSummaryReport {
    totalStudents: number;
    totalDays: number;
    presentCount: number;
    absentCount: number;
    lateCount: number;
    attendanceRate: number;
    byDate: Array<{
        date: string;
        present: number;
        absent: number;
        late: number;
    }>;
}

/**
 * Interface for fee collection report.
 */
export interface FeeCollectionReport {
    totalExpected: number;
    totalCollected: number;
    totalOutstanding: number;
    collectionRate: number;
    byFeeType: Array<{
        feeType: string;
        expected: number;
        collected: number;
        outstanding: number;
    }>;
    byPaymentMethod: Array<{
        method: string;
        amount: number;
        count: number;
    }>;
}

/**
 * Interface for class performance report.
 */
export interface ClassPerformanceReport {
    className: string;
    sectionName: string;
    totalStudents: number;
    assessmentCount: number;
    averageScore: number;
    highestScore: number;
    lowestScore: number;
    passRate: number;
    gradeDistribution: Array<{
        grade: string;
        count: number;
        percentage: number;
    }>;
}

/**
 * Interface for student performance report.
 */
export interface StudentPerformanceReport {
    studentId: string;
    studentName: string;
    subjects: Array<{
        subjectName: string;
        assessments: Array<{
            name: string;
            score: number;
            maxScore: number;
            percentage: number;
        }>;
        averageScore: number;
    }>;
    overallAverage: number;
}

/**
 * Interface for enrollment report.
 */
export interface EnrollmentReport {
    totalStudents: number;
    byStatus: Array<{
        status: string;
        count: number;
        percentage: number;
    }>;
    byClass: Array<{
        className: string;
        sections: Array<{
            sectionName: string;
            count: number;
        }>;
        totalCount: number;
    }>;
    byGender: Array<{
        gender: string;
        count: number;
        percentage: number;
    }>;
}

/**
 * Service for generating various reports.
 * All reports are scoped by school for multi-tenancy.
 */
@Injectable()
export class ReportsService {
    constructor(
        @InjectRepository(Attendance)
        private readonly attendanceRepository: Repository<Attendance>,
        @InjectRepository(StudentFee)
        private readonly studentFeeRepository: Repository<StudentFee>,
        @InjectRepository(Payment)
        private readonly paymentRepository: Repository<Payment>,
        @InjectRepository(Grade)
        private readonly gradeRepository: Repository<Grade>,
        @InjectRepository(Student)
        private readonly studentRepository: Repository<Student>,
    ) { }

    /**
     * Get attendance summary for a school within a date range.
     */
    async getAttendanceSummary(
        schoolId: string,
        startDate: string,
        endDate: string,
        sectionId?: string,
    ): Promise<AttendanceSummaryReport> {
        const queryBuilder = this.attendanceRepository
            .createQueryBuilder('attendance')
            .where('attendance.school_id = :schoolId', { schoolId })
            .andWhere('attendance.date BETWEEN :startDate AND :endDate', {
                startDate,
                endDate,
            });

        if (sectionId) {
            queryBuilder.andWhere('attendance.section_id = :sectionId', { sectionId });
        }

        // Get counts by status
        const statusCounts = await queryBuilder
            .select('attendance.status', 'status')
            .addSelect('COUNT(*)', 'count')
            .groupBy('attendance.status')
            .getRawMany<{ status: string; count: string }>();

        // Get daily breakdown
        const dailyCounts = await this.attendanceRepository
            .createQueryBuilder('attendance')
            .select('attendance.date', 'date')
            .addSelect('attendance.status', 'status')
            .addSelect('COUNT(*)', 'count')
            .where('attendance.school_id = :schoolId', { schoolId })
            .andWhere('attendance.date BETWEEN :startDate AND :endDate', {
                startDate,
                endDate,
            })
            .groupBy('attendance.date')
            .addGroupBy('attendance.status')
            .orderBy('attendance.date', 'ASC')
            .getRawMany<{ date: string; status: string; count: string }>();

        // Process daily counts into grouped format
        const byDateMap = new Map<string, { present: number; absent: number; late: number }>();
        for (const row of dailyCounts) {
            const dateStr = row.date.toString().split('T')[0];
            if (!byDateMap.has(dateStr)) {
                byDateMap.set(dateStr, { present: 0, absent: 0, late: 0 });
            }
            const dayData = byDateMap.get(dateStr)!;
            const count = parseInt(row.count, 10);
            if (row.status === AttendanceStatus.PRESENT) {
                dayData.present = count;
            } else if (row.status === AttendanceStatus.ABSENT) {
                dayData.absent = count;
            } else if (row.status === AttendanceStatus.LATE) {
                dayData.late = count;
            }
        }

        const byDate = Array.from(byDateMap.entries()).map(([date, counts]) => ({
            date,
            ...counts,
        }));

        // Calculate totals
        let presentCount = 0;
        let absentCount = 0;
        let lateCount = 0;

        for (const row of statusCounts) {
            const count = parseInt(row.count, 10);
            if (row.status === AttendanceStatus.PRESENT) {
                presentCount = count;
            } else if (row.status === AttendanceStatus.ABSENT) {
                absentCount = count;
            } else if (row.status === AttendanceStatus.LATE) {
                lateCount = count;
            }
        }

        const totalRecords = presentCount + absentCount + lateCount;
        const attendanceRate = totalRecords > 0 ? ((presentCount + lateCount) / totalRecords) * 100 : 0;

        // Get unique student count
        const studentCountResult = await this.attendanceRepository
            .createQueryBuilder('attendance')
            .select('COUNT(DISTINCT attendance.student_id)', 'count')
            .where('attendance.school_id = :schoolId', { schoolId })
            .getRawOne<{ count: string }>();

        return {
            totalStudents: parseInt(studentCountResult?.count ?? '0', 10),
            totalDays: byDate.length,
            presentCount,
            absentCount,
            lateCount,
            attendanceRate: Math.round(attendanceRate * 100) / 100,
            byDate,
        };
    }

    /**
     * Get fee collection summary for a school.
     */
    async getFeeCollectionReport(
        schoolId: string,
        startDate: string,
        endDate: string,
    ): Promise<FeeCollectionReport> {
        // Get expected fees
        const feesQuery = await this.studentFeeRepository
            .createQueryBuilder('sf')
            .innerJoin('sf.feeStructure', 'fs')
            .innerJoin('fs.feeType', 'ft')
            .select('ft.name', 'feeType')
            .addSelect('SUM(sf.net_amount)', 'expected')
            .addSelect('SUM(sf.paid_amount)', 'collected')
            .where('sf.school_id = :schoolId', { schoolId })
            .groupBy('ft.name')
            .getRawMany<{ feeType: string; expected: string; collected: string }>();

        const byFeeType = feesQuery.map((row) => ({
            feeType: row.feeType,
            expected: parseFloat(row.expected) || 0,
            collected: parseFloat(row.collected) || 0,
            outstanding: (parseFloat(row.expected) || 0) - (parseFloat(row.collected) || 0),
        }));

        // Get payments by method
        const paymentsQuery = await this.paymentRepository
            .createQueryBuilder('payment')
            .select('payment.payment_method', 'method')
            .addSelect('SUM(payment.amount)', 'amount')
            .addSelect('COUNT(*)', 'count')
            .where('payment.school_id = :schoolId', { schoolId })
            .andWhere('payment.payment_date BETWEEN :startDate AND :endDate', {
                startDate,
                endDate,
            })
            .groupBy('payment.payment_method')
            .getRawMany<{ method: string; amount: string; count: string }>();

        const byPaymentMethod = paymentsQuery.map((row) => ({
            method: row.method,
            amount: parseFloat(row.amount) || 0,
            count: parseInt(row.count, 10),
        }));

        // Calculate totals
        const totalExpected = byFeeType.reduce((sum, row) => sum + row.expected, 0);
        const totalCollected = byFeeType.reduce((sum, row) => sum + row.collected, 0);
        const totalOutstanding = totalExpected - totalCollected;
        const collectionRate = totalExpected > 0 ? (totalCollected / totalExpected) * 100 : 0;

        return {
            totalExpected,
            totalCollected,
            totalOutstanding,
            collectionRate: Math.round(collectionRate * 100) / 100,
            byFeeType,
            byPaymentMethod,
        };
    }

    /**
     * Get enrollment statistics for a school.
     */
    async getEnrollmentReport(schoolId: string): Promise<EnrollmentReport> {
        // Get total and by status
        const statusQuery = await this.studentRepository
            .createQueryBuilder('student')
            .select('student.status', 'status')
            .addSelect('COUNT(*)', 'count')
            .where('student.school_id = :schoolId', { schoolId })
            .andWhere('student.deleted_at IS NULL')
            .groupBy('student.status')
            .getRawMany<{ status: string; count: string }>();

        const totalStudents = statusQuery.reduce(
            (sum, row) => sum + parseInt(row.count, 10),
            0,
        );

        const byStatus = statusQuery.map((row) => ({
            status: row.status,
            count: parseInt(row.count, 10),
            percentage: totalStudents > 0
                ? Math.round((parseInt(row.count, 10) / totalStudents) * 10000) / 100
                : 0,
        }));

        // Get by gender
        const genderQuery = await this.studentRepository
            .createQueryBuilder('student')
            .select('student.gender', 'gender')
            .addSelect('COUNT(*)', 'count')
            .where('student.school_id = :schoolId', { schoolId })
            .andWhere('student.deleted_at IS NULL')
            .groupBy('student.gender')
            .getRawMany<{ gender: string; count: string }>();

        const byGender = genderQuery.map((row) => ({
            gender: row.gender,
            count: parseInt(row.count, 10),
            percentage: totalStudents > 0
                ? Math.round((parseInt(row.count, 10) / totalStudents) * 10000) / 100
                : 0,
        }));

        return {
            totalStudents,
            byStatus,
            byClass: [], // Would require joining with class/section tables
            byGender,
        };
    }

    /**
     * Get grade statistics for a class/section.
     */
    async getClassPerformanceReport(
        schoolId: string,
        assessmentId: string,
    ): Promise<ClassPerformanceReport> {
        const grades = await this.gradeRepository
            .createQueryBuilder('grade')
            .innerJoinAndSelect('grade.assessment', 'assessment')
            .where('assessment.id = :assessmentId', { assessmentId })
            .andWhere('assessment.school_id = :schoolId', { schoolId })
            .getMany();

        if (grades.length === 0) {
            return {
                className: '',
                sectionName: '',
                totalStudents: 0,
                assessmentCount: 0,
                averageScore: 0,
                highestScore: 0,
                lowestScore: 0,
                passRate: 0,
                gradeDistribution: [],
            };
        }

        const scores = grades.map((g) => g.marksObtained ?? 0);
        const maxScore = grades[0]?.assessment?.totalMarks ?? 100;
        const passingScore = maxScore * 0.4; // 40% passing

        const averageScore = scores.reduce((a, b) => a + b, 0) / scores.length;
        const passCount = scores.filter((s) => s >= passingScore).length;

        // Calculate grade distribution
        const gradeRanges = [
            { grade: 'A+', min: 90, max: 100 },
            { grade: 'A', min: 80, max: 89 },
            { grade: 'B+', min: 70, max: 79 },
            { grade: 'B', min: 60, max: 69 },
            { grade: 'C', min: 50, max: 59 },
            { grade: 'D', min: 40, max: 49 },
            { grade: 'F', min: 0, max: 39 },
        ];

        const gradeDistribution = gradeRanges.map((range) => {
            const count = scores.filter((score) => {
                const percentage = (score / maxScore) * 100;
                return percentage >= range.min && percentage <= range.max;
            }).length;
            return {
                grade: range.grade,
                count,
                percentage: Math.round((count / scores.length) * 10000) / 100,
            };
        });

        return {
            className: '',
            sectionName: '',
            totalStudents: grades.length,
            assessmentCount: 1,
            averageScore: Math.round(averageScore * 100) / 100,
            highestScore: Math.max(...scores),
            lowestScore: Math.min(...scores),
            passRate: Math.round((passCount / grades.length) * 10000) / 100,
            gradeDistribution,
        };
    }
}
