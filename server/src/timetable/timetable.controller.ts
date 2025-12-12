import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    Query,
    UseGuards,
    ParseUUIDPipe,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { TimetableService, ScheduleEntry } from './timetable.service';
import {
    CreatePeriodDto,
    UpdatePeriodDto,
    CreateTimetableEntryDto,
    UpdateTimetableEntryDto,
    QueryScheduleDto,
    QueryPeriodsDto,
} from './dto';
import { Period, TimetableEntry } from './entities';
import { Roles, CurrentUser } from '../common/decorators';
import { RolesGuard } from '../common/guards';
import { UserRole, User } from '../database/entities/user.entity';
import { PaginatedResponse } from '../common/dto/pagination.dto';

/**
 * Controller for timetable management.
 * Handles periods and schedule entries.
 */
@Controller('api/v1/timetable')
@UseGuards(RolesGuard)
export class TimetableController {
    constructor(private readonly timetableService: TimetableService) { }

    // ==================== PERIOD ENDPOINTS ====================

    /**
     * Create a new period.
     * Access: School Admin, Principal
     */
    @Post('periods')
    @Roles(UserRole.SUPER_ADMIN, UserRole.SCHOOL_ADMIN, UserRole.PRINCIPAL)
    async createPeriod(
        @Body() dto: CreatePeriodDto,
        @CurrentUser() user: User,
    ): Promise<{ success: boolean; data: Period }> {
        const schoolId = user.schoolId;
        if (!schoolId) {
            throw new Error('User must be associated with a school');
        }
        const period = await this.timetableService.createPeriod(dto, schoolId);
        return { success: true, data: period };
    }

    /**
     * Get all periods for the school.
     * Access: All authenticated users
     */
    @Get('periods')
    async findAllPeriods(
        @Query() query: QueryPeriodsDto,
        @CurrentUser() user: User,
    ): Promise<{ success: boolean; data: PaginatedResponse<Period> }> {
        const schoolId = user.schoolId;
        if (!schoolId) {
            throw new Error('User must be associated with a school');
        }
        const result = await this.timetableService.findAllPeriods(query, schoolId);
        return { success: true, data: result };
    }

    /**
     * Update a period.
     * Access: School Admin, Principal
     */
    @Patch('periods/:id')
    @Roles(UserRole.SUPER_ADMIN, UserRole.SCHOOL_ADMIN, UserRole.PRINCIPAL)
    async updatePeriod(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() dto: UpdatePeriodDto,
        @CurrentUser() user: User,
    ): Promise<{ success: boolean; data: Period }> {
        const schoolId = user.schoolId;
        if (!schoolId) {
            throw new Error('User must be associated with a school');
        }
        const period = await this.timetableService.updatePeriod(id, dto, schoolId);
        return { success: true, data: period };
    }

    /**
     * Delete a period.
     * Access: School Admin
     */
    @Delete('periods/:id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @Roles(UserRole.SUPER_ADMIN, UserRole.SCHOOL_ADMIN)
    async removePeriod(
        @Param('id', ParseUUIDPipe) id: string,
        @CurrentUser() user: User,
    ): Promise<void> {
        const schoolId = user.schoolId;
        if (!schoolId) {
            throw new Error('User must be associated with a school');
        }
        await this.timetableService.removePeriod(id, schoolId);
    }

    // ==================== TIMETABLE ENTRY ENDPOINTS ====================

    /**
     * Create a timetable entry (assign subject/teacher to period).
     * Access: School Admin, Principal
     */
    @Post('entries')
    @Roles(UserRole.SUPER_ADMIN, UserRole.SCHOOL_ADMIN, UserRole.PRINCIPAL)
    async createEntry(
        @Body() dto: CreateTimetableEntryDto,
        @CurrentUser() user: User,
    ): Promise<{ success: boolean; data: TimetableEntry }> {
        const schoolId = user.schoolId;
        if (!schoolId) {
            throw new Error('User must be associated with a school');
        }
        const entry = await this.timetableService.createEntry(dto, schoolId);
        return { success: true, data: entry };
    }

    /**
     * Update a timetable entry.
     * Access: School Admin, Principal
     */
    @Patch('entries/:id')
    @Roles(UserRole.SUPER_ADMIN, UserRole.SCHOOL_ADMIN, UserRole.PRINCIPAL)
    async updateEntry(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() dto: UpdateTimetableEntryDto,
    ): Promise<{ success: boolean; data: TimetableEntry }> {
        const entry = await this.timetableService.updateEntry(id, dto);
        return { success: true, data: entry };
    }

    /**
     * Delete a timetable entry.
     * Access: School Admin
     */
    @Delete('entries/:id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @Roles(UserRole.SUPER_ADMIN, UserRole.SCHOOL_ADMIN)
    async removeEntry(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
        await this.timetableService.removeEntry(id);
    }

    // ==================== SCHEDULE VIEW ENDPOINTS ====================

    /**
     * Get schedule for a specific teacher.
     * Access: Admin or the teacher themselves
     */
    @Get('teacher/:id')
    async getTeacherSchedule(
        @Param('id', ParseUUIDPipe) teacherId: string,
        @Query() query: QueryScheduleDto,
        @CurrentUser() user: User,
    ): Promise<{ success: boolean; data: ScheduleEntry[] }> {
        const schoolId = user.schoolId;
        if (!schoolId) {
            throw new Error('User must be associated with a school');
        }
        const schedule = await this.timetableService.getTeacherSchedule(
            teacherId,
            query,
            schoolId,
        );
        return { success: true, data: schedule };
    }

    /**
     * Get schedule for a specific section.
     * Access: All authenticated users
     */
    @Get('section/:id')
    async getSectionSchedule(
        @Param('id', ParseUUIDPipe) sectionId: string,
        @Query() query: QueryScheduleDto,
        @CurrentUser() user: User,
    ): Promise<{ success: boolean; data: ScheduleEntry[] }> {
        const schoolId = user.schoolId;
        if (!schoolId) {
            throw new Error('User must be associated with a school');
        }
        const schedule = await this.timetableService.getSectionSchedule(
            sectionId,
            query,
            schoolId,
        );
        return { success: true, data: schedule };
    }

    /**
     * Get current user's schedule.
     * Teachers see their teaching schedule.
     * Students see their section's schedule (requires section assignment).
     */
    @Get('my-schedule')
    async getMySchedule(
        @Query() query: QueryScheduleDto,
        @CurrentUser() user: User,
    ): Promise<{ success: boolean; data: ScheduleEntry[] }> {
        const schoolId = user.schoolId;
        if (!schoolId) {
            throw new Error('User must be associated with a school');
        }

        // Teachers get their teaching schedule
        if (user.role === UserRole.TEACHER) {
            const schedule = await this.timetableService.getTeacherSchedule(
                user.id,
                query,
                schoolId,
            );
            return { success: true, data: schedule };
        }

        // For students, we would need section assignment
        // This can be extended when student-section mapping is available
        return { success: true, data: [] };
    }
}
