import {
    Controller,
    Get,
    Query,
    UseGuards,
} from '@nestjs/common';
import {
    ReportsService,
    AttendanceSummaryReport,
    FeeCollectionReport,
    EnrollmentReport,
    ClassPerformanceReport,
} from './reports.service';
import {
    AttendanceSummaryQueryDto,
    FeeCollectionQueryDto,
    ClassPerformanceQueryDto,
} from './dto';
import { Roles, CurrentUser } from '../common/decorators';
import { RolesGuard } from '../common/guards';
import { UserRole, User } from '../database/entities/user.entity';

/**
 * Controller for generating reports.
 */
@Controller('api/v1/reports')
@UseGuards(RolesGuard)
export class ReportsController {
    constructor(private readonly reportsService: ReportsService) { }

    /**
     * Get attendance summary report.
     * Access: Admin, Principal, Teacher
     */
    @Get('attendance-summary')
    @Roles(
        UserRole.SUPER_ADMIN,
        UserRole.SCHOOL_ADMIN,
        UserRole.PRINCIPAL,
        UserRole.VICE_PRINCIPAL,
        UserRole.TEACHER,
    )
    async getAttendanceSummary(
        @Query() query: AttendanceSummaryQueryDto,
        @CurrentUser() user: User,
    ): Promise<{ success: boolean; data: AttendanceSummaryReport }> {
        const schoolId = user.schoolId;
        if (!schoolId) {
            throw new Error('User must be associated with a school');
        }
        const report = await this.reportsService.getAttendanceSummary(
            schoolId,
            query.startDate,
            query.endDate,
            query.sectionId,
        );
        return { success: true, data: report };
    }

    /**
     * Get fee collection report.
     * Access: Admin, Principal, Accountant
     */
    @Get('fee-collection')
    @Roles(
        UserRole.SUPER_ADMIN,
        UserRole.SCHOOL_ADMIN,
        UserRole.PRINCIPAL,
        UserRole.ACCOUNTANT,
    )
    async getFeeCollectionReport(
        @Query() query: FeeCollectionQueryDto,
        @CurrentUser() user: User,
    ): Promise<{ success: boolean; data: FeeCollectionReport }> {
        const schoolId = user.schoolId;
        if (!schoolId) {
            throw new Error('User must be associated with a school');
        }
        const report = await this.reportsService.getFeeCollectionReport(
            schoolId,
            query.startDate,
            query.endDate,
        );
        return { success: true, data: report };
    }

    /**
     * Get enrollment statistics.
     * Access: Admin, Principal
     */
    @Get('enrollment')
    @Roles(
        UserRole.SUPER_ADMIN,
        UserRole.SCHOOL_ADMIN,
        UserRole.PRINCIPAL,
        UserRole.VICE_PRINCIPAL,
    )
    async getEnrollmentReport(
        @CurrentUser() user: User,
    ): Promise<{ success: boolean; data: EnrollmentReport }> {
        const schoolId = user.schoolId;
        if (!schoolId) {
            throw new Error('User must be associated with a school');
        }
        const report = await this.reportsService.getEnrollmentReport(schoolId);
        return { success: true, data: report };
    }

    /**
     * Get class performance for an assessment.
     * Access: Admin, Principal, Teacher
     */
    @Get('class-performance')
    @Roles(
        UserRole.SUPER_ADMIN,
        UserRole.SCHOOL_ADMIN,
        UserRole.PRINCIPAL,
        UserRole.VICE_PRINCIPAL,
        UserRole.TEACHER,
    )
    async getClassPerformance(
        @Query() query: ClassPerformanceQueryDto,
        @CurrentUser() user: User,
    ): Promise<{ success: boolean; data: ClassPerformanceReport }> {
        const schoolId = user.schoolId;
        if (!schoolId) {
            throw new Error('User must be associated with a school');
        }
        const report = await this.reportsService.getClassPerformanceReport(
            schoolId,
            query.assessmentId,
        );
        return { success: true, data: report };
    }
}
