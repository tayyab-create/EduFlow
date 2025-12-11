import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Param,
    Body,
    Query,
    ParseUUIDPipe,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { AttendanceService, AttendanceStats, StudentAttendanceSummary } from './attendance.service';
import {
    CreateAttendanceDto,
    BulkAttendanceDto,
    QuickBulkAttendanceDto,
    UpdateAttendanceDto,
    CorrectAttendanceDto,
    QueryAttendanceDto,
} from './dto';
import { Attendance } from './entities/attendance.entity';
import { PaginatedResponse } from '../common/dto/pagination.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { User, UserRole } from '../database/entities/user.entity';

@Controller('attendance')
export class AttendanceController {
    constructor(private readonly attendanceService: AttendanceService) { }

    /**
     * Mark attendance for a single student.
     */
    @Post()
    @Roles(
        UserRole.SUPER_ADMIN,
        UserRole.ORG_ADMIN,
        UserRole.SCHOOL_ADMIN,
        UserRole.PRINCIPAL,
        UserRole.VICE_PRINCIPAL,
        UserRole.TEACHER,
    )
    async create(
        @Body() createDto: CreateAttendanceDto,
        @CurrentUser() user: User,
    ): Promise<Attendance> {
        return this.attendanceService.create(createDto, user.id);
    }

    /**
     * Bulk mark attendance for a section.
     * Primary endpoint for teachers to mark entire class.
     */
    @Post('bulk')
    @Roles(
        UserRole.SUPER_ADMIN,
        UserRole.ORG_ADMIN,
        UserRole.SCHOOL_ADMIN,
        UserRole.PRINCIPAL,
        UserRole.VICE_PRINCIPAL,
        UserRole.TEACHER,
    )
    async bulkMark(
        @Body() bulkDto: BulkAttendanceDto,
        @CurrentUser() user: User,
    ): Promise<{ created: number; updated: number }> {
        return this.attendanceService.bulkMark(bulkDto, user.id, user.schoolId);
    }

    /**
     * Quick bulk mark - Mark all present except specified exceptions.
     * Enables the "Mark All Present" -> "Tap Exceptions" flow from PRD.
     */
    @Post('quick-bulk')
    @Roles(
        UserRole.SUPER_ADMIN,
        UserRole.ORG_ADMIN,
        UserRole.SCHOOL_ADMIN,
        UserRole.PRINCIPAL,
        UserRole.VICE_PRINCIPAL,
        UserRole.TEACHER,
    )
    async quickBulkMark(
        @Body() quickBulkDto: QuickBulkAttendanceDto,
        @CurrentUser() user: User,
    ): Promise<{ created: number; updated: number }> {
        return this.attendanceService.quickBulkMark(quickBulkDto, user.id, user.schoolId);
    }

    /**
     * Get all attendance records with filtering.
     */
    @Get()
    async findAll(
        @Query() query: QueryAttendanceDto,
        @CurrentUser() user: User,
    ): Promise<PaginatedResponse<Attendance>> {
        return this.attendanceService.findAll(query, user.schoolId);
    }

    /**
     * Get attendance for a section on a specific date.
     */
    @Get('section/:sectionId/date/:date')
    async getByDateAndSection(
        @Param('sectionId', ParseUUIDPipe) sectionId: string,
        @Param('date') date: string,
        @CurrentUser() user: User,
    ): Promise<Attendance[]> {
        return this.attendanceService.getByDateAndSection(sectionId, date, user.schoolId);
    }

    /**
     * Get attendance statistics for a section on a date.
     */
    @Get('stats/section/:sectionId/date/:date')
    async getSectionStats(
        @Param('sectionId', ParseUUIDPipe) sectionId: string,
        @Param('date') date: string,
        @CurrentUser() user: User,
    ): Promise<AttendanceStats> {
        return this.attendanceService.getSectionStats(sectionId, date, user.schoolId);
    }

    /**
     * Get student attendance summary for a date range.
     */
    @Get('summary/student/:studentId')
    async getStudentSummary(
        @Param('studentId', ParseUUIDPipe) studentId: string,
        @Query('startDate') startDate: string,
        @Query('endDate') endDate: string,
        @CurrentUser() user: User,
    ): Promise<StudentAttendanceSummary> {
        return this.attendanceService.getStudentSummary(
            studentId,
            startDate,
            endDate,
            user.schoolId,
        );
    }

    /**
     * Check if attendance is already marked for a section.
     */
    @Get('check/:sectionId/:date')
    async isMarked(
        @Param('sectionId', ParseUUIDPipe) sectionId: string,
        @Param('date') date: string,
    ): Promise<{ marked: boolean }> {
        const marked = await this.attendanceService.isMarked(sectionId, date);
        return { marked };
    }

    /**
     * Get single attendance record.
     */
    @Get(':id')
    async findOne(
        @Param('id', ParseUUIDPipe) id: string,
        @CurrentUser() user: User,
    ): Promise<Attendance> {
        return this.attendanceService.findOne(id, user.schoolId);
    }

    /**
     * Update attendance record.
     */
    @Patch(':id')
    @Roles(
        UserRole.SUPER_ADMIN,
        UserRole.ORG_ADMIN,
        UserRole.SCHOOL_ADMIN,
        UserRole.PRINCIPAL,
        UserRole.VICE_PRINCIPAL,
        UserRole.TEACHER,
    )
    async update(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() updateDto: UpdateAttendanceDto,
        @CurrentUser() user: User,
    ): Promise<Attendance> {
        return this.attendanceService.update(id, updateDto, user.schoolId);
    }

    /**
     * Correct attendance with audit trail.
     * Requires a correction reason.
     */
    @Post(':id/correct')
    @Roles(
        UserRole.SUPER_ADMIN,
        UserRole.ORG_ADMIN,
        UserRole.SCHOOL_ADMIN,
        UserRole.PRINCIPAL,
        UserRole.VICE_PRINCIPAL,
        UserRole.TEACHER,
    )
    async correct(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() correctDto: CorrectAttendanceDto,
        @CurrentUser() user: User,
    ): Promise<Attendance> {
        return this.attendanceService.correct(id, correctDto, user.id, user.schoolId);
    }

    /**
     * Delete attendance record.
     */
    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @Roles(UserRole.SUPER_ADMIN, UserRole.ORG_ADMIN, UserRole.SCHOOL_ADMIN)
    async remove(
        @Param('id', ParseUUIDPipe) id: string,
        @CurrentUser() user: User,
    ): Promise<void> {
        return this.attendanceService.remove(id, user.schoolId);
    }
}
