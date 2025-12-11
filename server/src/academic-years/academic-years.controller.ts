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
import { AcademicYearsService } from './academic-years.service';
import {
    CreateAcademicYearDto,
    UpdateAcademicYearDto,
    QueryAcademicYearsDto,
} from './dto';
import { AcademicYear } from './entities/academic-year.entity';
import { PaginatedResponse } from '../common/dto/pagination.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { User, UserRole } from '../database/entities/user.entity';

@Controller('academic-years')
export class AcademicYearsController {
    constructor(private readonly academicYearsService: AcademicYearsService) { }

    /**
     * Create a new academic year.
     * Allowed: Super Admin, Org Admin, School Admin, Principal
     */
    @Post()
    @Roles(
        UserRole.SUPER_ADMIN,
        UserRole.ORG_ADMIN,
        UserRole.SCHOOL_ADMIN,
        UserRole.PRINCIPAL,
    )
    async create(
        @Body() createDto: CreateAcademicYearDto,
        @CurrentUser() user: User,
    ): Promise<AcademicYear> {
        return this.academicYearsService.create(createDto, user.schoolId);
    }

    /**
     * Get all academic years with pagination.
     * Accessible by all authenticated users within their school.
     */
    @Get()
    async findAll(
        @Query() query: QueryAcademicYearsDto,
        @CurrentUser() user: User,
    ): Promise<PaginatedResponse<AcademicYear>> {
        return this.academicYearsService.findAll(query, user.schoolId);
    }

    /**
     * Get the current academic year.
     */
    @Get('current')
    async findCurrent(@CurrentUser() user: User): Promise<AcademicYear | null> {
        return this.academicYearsService.findCurrent(user.schoolId);
    }

    /**
     * Get a specific academic year by ID.
     */
    @Get(':id')
    async findOne(
        @Param('id', ParseUUIDPipe) id: string,
        @CurrentUser() user: User,
    ): Promise<AcademicYear> {
        return this.academicYearsService.findOne(id, user.schoolId);
    }

    /**
     * Update an academic year.
     * Allowed: Super Admin, Org Admin, School Admin, Principal
     */
    @Patch(':id')
    @Roles(
        UserRole.SUPER_ADMIN,
        UserRole.ORG_ADMIN,
        UserRole.SCHOOL_ADMIN,
        UserRole.PRINCIPAL,
    )
    async update(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() updateDto: UpdateAcademicYearDto,
        @CurrentUser() user: User,
    ): Promise<AcademicYear> {
        return this.academicYearsService.update(id, updateDto, user.schoolId);
    }

    /**
     * Delete an academic year.
     * Allowed: Super Admin, Org Admin, School Admin
     */
    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @Roles(UserRole.SUPER_ADMIN, UserRole.ORG_ADMIN, UserRole.SCHOOL_ADMIN)
    async remove(
        @Param('id', ParseUUIDPipe) id: string,
        @CurrentUser() user: User,
    ): Promise<void> {
        return this.academicYearsService.remove(id, user.schoolId);
    }

    /**
     * Set an academic year as the current one.
     * Allowed: Super Admin, Org Admin, School Admin, Principal
     */
    @Post(':id/set-current')
    @Roles(
        UserRole.SUPER_ADMIN,
        UserRole.ORG_ADMIN,
        UserRole.SCHOOL_ADMIN,
        UserRole.PRINCIPAL,
    )
    async setCurrent(
        @Param('id', ParseUUIDPipe) id: string,
        @CurrentUser() user: User,
    ): Promise<AcademicYear> {
        return this.academicYearsService.setCurrent(id, user.schoolId);
    }
}
