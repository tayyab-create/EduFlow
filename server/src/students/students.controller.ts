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
import { StudentsService } from './students.service';
import { CreateStudentDto, UpdateStudentDto, QueryStudentsDto } from './dto';
import { Student } from './entities/student.entity';
import { PaginatedResponse } from '../common/dto/pagination.dto';
import { Roles, SchoolId } from '../common/decorators';
import { RolesGuard, TenantGuard } from '../common/guards';
import { UserRole } from '../database/entities/user.entity';

/**
 * Controller for student management.
 * All routes require authentication and enforce multi-tenancy.
 */
@Controller('api/v1/students')
@UseGuards(TenantGuard, RolesGuard)
export class StudentsController {
    constructor(private readonly studentsService: StudentsService) { }

    /**
     * Create a new student.
     * Access: School Admin, Principal, Vice Principal, Receptionist
     */
    @Post()
    @Roles(
        UserRole.SCHOOL_ADMIN,
        UserRole.PRINCIPAL,
        UserRole.VICE_PRINCIPAL,
        UserRole.RECEPTIONIST,
    )
    async create(
        @Body() createStudentDto: CreateStudentDto,
        @SchoolId() schoolId: string,
    ): Promise<Student> {
        return this.studentsService.create(createStudentDto, schoolId);
    }

    /**
     * Get all students with pagination and filtering.
     * Access: All staff roles
     */
    @Get()
    @Roles(
        UserRole.SCHOOL_ADMIN,
        UserRole.PRINCIPAL,
        UserRole.VICE_PRINCIPAL,
        UserRole.TEACHER,
        UserRole.ACCOUNTANT,
        UserRole.LIBRARIAN,
        UserRole.RECEPTIONIST,
    )
    async findAll(
        @Query() query: QueryStudentsDto,
        @SchoolId() schoolId: string,
    ): Promise<PaginatedResponse<Student>> {
        return this.studentsService.findAll(query, schoolId);
    }

    /**
     * Get student count by status.
     * Access: Admin roles
     */
    @Get('stats/count-by-status')
    @Roles(UserRole.SCHOOL_ADMIN, UserRole.PRINCIPAL, UserRole.VICE_PRINCIPAL)
    async countByStatus(
        @SchoolId() schoolId: string,
    ): Promise<Record<string, number>> {
        return this.studentsService.countByStatus(schoolId);
    }

    /**
     * Get a single student by ID.
     * Access: All staff roles
     */
    @Get(':id')
    @Roles(
        UserRole.SCHOOL_ADMIN,
        UserRole.PRINCIPAL,
        UserRole.VICE_PRINCIPAL,
        UserRole.TEACHER,
        UserRole.ACCOUNTANT,
        UserRole.LIBRARIAN,
        UserRole.RECEPTIONIST,
    )
    async findOne(
        @Param('id', ParseUUIDPipe) id: string,
        @SchoolId() schoolId: string,
    ): Promise<Student> {
        return this.studentsService.findOne(id, schoolId);
    }

    /**
     * Update a student.
     * Access: Admin roles
     */
    @Patch(':id')
    @Roles(
        UserRole.SCHOOL_ADMIN,
        UserRole.PRINCIPAL,
        UserRole.VICE_PRINCIPAL,
        UserRole.RECEPTIONIST,
    )
    async update(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() updateStudentDto: UpdateStudentDto,
        @SchoolId() schoolId: string,
    ): Promise<Student> {
        return this.studentsService.update(id, updateStudentDto, schoolId);
    }

    /**
     * Soft delete a student.
     * Access: Admin only
     */
    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @Roles(UserRole.SCHOOL_ADMIN, UserRole.PRINCIPAL)
    async remove(
        @Param('id', ParseUUIDPipe) id: string,
        @SchoolId() schoolId: string,
    ): Promise<void> {
        return this.studentsService.remove(id, schoolId);
    }
}
