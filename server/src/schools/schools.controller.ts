import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
    ParseUUIDPipe,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { SchoolsService } from './schools.service';
import { CreateSchoolDto, UpdateSchoolDto } from './dto';
import { School } from '../database/entities/school.entity';
import { Roles, CurrentUser } from '../common/decorators';
import { RolesGuard } from '../common/guards';
import { UserRole, User } from '../database/entities/user.entity';

/**
 * Controller for school management.
 * Most routes require Super Admin access.
 */
@Controller('api/v1/schools')
@UseGuards(RolesGuard)
export class SchoolsController {
    constructor(private readonly schoolsService: SchoolsService) { }

    /**
     * Create a new school.
     * Access: Super Admin (any organization) or Org Admin (within their organization)
     */
    @Post()
    @Roles(UserRole.SUPER_ADMIN, UserRole.ORG_ADMIN)
    async create(
        @Body() createSchoolDto: CreateSchoolDto,
        @CurrentUser() user: User
    ): Promise<School> {
        return this.schoolsService.create(createSchoolDto, user);
    }

    /**
     * Get all schools.
     * Access: Super Admin only
     */
    @Get()
    @Roles(UserRole.SUPER_ADMIN)
    async findAll(): Promise<School[]> {
        return this.schoolsService.findAll();
    }

    /**
     * Get current user's school.
     * Access: Any authenticated user with a school
     */
    @Get('my-school')
    async getMySchool(@CurrentUser() user: User): Promise<School> {
        if (!user.schoolId) {
            throw new Error('User is not associated with any school');
        }
        return this.schoolsService.findOne(user.schoolId);
    }

    /**
     * Get a school by ID.
     * Access: Super Admin or School Admin of that school
     */
    @Get(':id')
    @Roles(UserRole.SUPER_ADMIN, UserRole.SCHOOL_ADMIN, UserRole.PRINCIPAL)
    async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<School> {
        return this.schoolsService.findOne(id);
    }

    /**
     * Update a school.
     * Access: Super Admin or School Admin of that school
     */
    @Patch(':id')
    @Roles(UserRole.SUPER_ADMIN, UserRole.SCHOOL_ADMIN)
    async update(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() updateSchoolDto: UpdateSchoolDto,
    ): Promise<School> {
        return this.schoolsService.update(id, updateSchoolDto);
    }

    /**
     * Delete a school (soft delete).
     * Access: Super Admin only
     */
    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @Roles(UserRole.SUPER_ADMIN)
    async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
        return this.schoolsService.remove(id);
    }
}
