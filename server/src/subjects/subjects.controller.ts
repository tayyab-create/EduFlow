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
import { SubjectsService } from './subjects.service';
import {
    CreateSubjectDto,
    UpdateSubjectDto,
    CreateClassSubjectDto,
    QuerySubjectsDto,
} from './dto';
import { Subject, ClassSubject } from './entities';
import { PaginatedResponse } from '../common/dto/pagination.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { User, UserRole } from '../database/entities/user.entity';

@Controller('subjects')
export class SubjectsController {
    constructor(private readonly subjectsService: SubjectsService) { }

    @Post()
    @Roles(
        UserRole.SUPER_ADMIN,
        UserRole.ORG_ADMIN,
        UserRole.SCHOOL_ADMIN,
        UserRole.PRINCIPAL,
    )
    async create(
        @Body() createDto: CreateSubjectDto,
        @CurrentUser() user: User,
    ): Promise<Subject> {
        return this.subjectsService.create(createDto, user.schoolId);
    }

    @Get()
    async findAll(
        @Query() query: QuerySubjectsDto,
        @CurrentUser() user: User,
    ): Promise<PaginatedResponse<Subject>> {
        return this.subjectsService.findAll(query, user.schoolId);
    }

    @Get(':id')
    async findOne(
        @Param('id', ParseUUIDPipe) id: string,
        @CurrentUser() user: User,
    ): Promise<Subject> {
        return this.subjectsService.findOne(id, user.schoolId);
    }

    @Patch(':id')
    @Roles(
        UserRole.SUPER_ADMIN,
        UserRole.ORG_ADMIN,
        UserRole.SCHOOL_ADMIN,
        UserRole.PRINCIPAL,
    )
    async update(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() updateDto: UpdateSubjectDto,
        @CurrentUser() user: User,
    ): Promise<Subject> {
        return this.subjectsService.update(id, updateDto, user.schoolId);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @Roles(UserRole.SUPER_ADMIN, UserRole.ORG_ADMIN, UserRole.SCHOOL_ADMIN)
    async remove(
        @Param('id', ParseUUIDPipe) id: string,
        @CurrentUser() user: User,
    ): Promise<void> {
        return this.subjectsService.remove(id, user.schoolId);
    }

    // Class-Subject assignment endpoints
    @Post('assign')
    @Roles(
        UserRole.SUPER_ADMIN,
        UserRole.ORG_ADMIN,
        UserRole.SCHOOL_ADMIN,
        UserRole.PRINCIPAL,
    )
    async assignToClass(
        @Body() createDto: CreateClassSubjectDto,
        @CurrentUser() user: User,
    ): Promise<ClassSubject> {
        return this.subjectsService.assignToClass(createDto, user.schoolId);
    }

    @Get('class/:classId')
    async getClassSubjects(
        @Param('classId', ParseUUIDPipe) classId: string,
    ): Promise<ClassSubject[]> {
        return this.subjectsService.getClassSubjects(classId);
    }

    @Delete('assignment/:id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @Roles(UserRole.SUPER_ADMIN, UserRole.ORG_ADMIN, UserRole.SCHOOL_ADMIN)
    async removeAssignment(
        @Param('id', ParseUUIDPipe) id: string,
    ): Promise<void> {
        return this.subjectsService.removeClassSubject(id);
    }
}
