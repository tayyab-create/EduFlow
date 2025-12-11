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
import { GradesService } from './grades.service';
import {
    CreateGradingScaleDto,
    CreateAssessmentDto,
    CreateGradeDto,
    BulkGradeDto,
    UpdateAssessmentDto,
    UpdateGradeDto,
    QueryAssessmentsDto,
} from './dto';
import { GradingScale, Assessment, Grade } from './entities';
import { PaginatedResponse } from '../common/dto/pagination.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { User, UserRole } from '../database/entities/user.entity';

// ==================== GRADING SCALES ====================

@Controller('grading-scales')
export class GradingScalesController {
    constructor(private readonly gradesService: GradesService) { }

    @Post()
    @Roles(UserRole.SUPER_ADMIN, UserRole.ORG_ADMIN, UserRole.SCHOOL_ADMIN)
    async create(
        @Body() dto: CreateGradingScaleDto,
        @CurrentUser() user: User,
    ): Promise<GradingScale> {
        return this.gradesService.createGradingScale(dto, user.schoolId);
    }

    @Get()
    async findAll(@CurrentUser() user: User): Promise<GradingScale[]> {
        return this.gradesService.findAllGradingScales(user.schoolId);
    }

    @Get('default')
    async findDefault(@CurrentUser() user: User): Promise<GradingScale | null> {
        return this.gradesService.findDefaultGradingScale(user.schoolId);
    }
}

// ==================== ASSESSMENTS ====================

@Controller('assessments')
export class AssessmentsController {
    constructor(private readonly gradesService: GradesService) { }

    @Post()
    @Roles(
        UserRole.SUPER_ADMIN,
        UserRole.ORG_ADMIN,
        UserRole.SCHOOL_ADMIN,
        UserRole.PRINCIPAL,
        UserRole.TEACHER,
    )
    async create(
        @Body() dto: CreateAssessmentDto,
        @CurrentUser() user: User,
    ): Promise<Assessment> {
        return this.gradesService.createAssessment(dto, user.id, user.schoolId);
    }

    @Get()
    async findAll(
        @Query() query: QueryAssessmentsDto,
        @CurrentUser() user: User,
    ): Promise<PaginatedResponse<Assessment>> {
        return this.gradesService.findAllAssessments(query, user.schoolId);
    }

    @Get(':id')
    async findOne(
        @Param('id', ParseUUIDPipe) id: string,
        @CurrentUser() user: User,
    ): Promise<Assessment> {
        return this.gradesService.findOneAssessment(id, user.schoolId);
    }

    @Patch(':id')
    @Roles(
        UserRole.SUPER_ADMIN,
        UserRole.ORG_ADMIN,
        UserRole.SCHOOL_ADMIN,
        UserRole.PRINCIPAL,
        UserRole.TEACHER,
    )
    async update(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() dto: UpdateAssessmentDto,
        @CurrentUser() user: User,
    ): Promise<Assessment> {
        return this.gradesService.updateAssessment(id, dto, user.schoolId);
    }

    @Post(':id/publish')
    @Roles(
        UserRole.SUPER_ADMIN,
        UserRole.ORG_ADMIN,
        UserRole.SCHOOL_ADMIN,
        UserRole.PRINCIPAL,
        UserRole.TEACHER,
    )
    async publish(
        @Param('id', ParseUUIDPipe) id: string,
        @CurrentUser() user: User,
    ): Promise<Assessment> {
        return this.gradesService.publishAssessment(id, user.schoolId);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @Roles(UserRole.SUPER_ADMIN, UserRole.ORG_ADMIN, UserRole.SCHOOL_ADMIN)
    async remove(
        @Param('id', ParseUUIDPipe) id: string,
        @CurrentUser() user: User,
    ): Promise<void> {
        return this.gradesService.removeAssessment(id, user.schoolId);
    }

    @Get(':id/grades')
    async getGrades(
        @Param('id', ParseUUIDPipe) id: string,
    ): Promise<Grade[]> {
        return this.gradesService.findGradesByAssessment(id);
    }
}

// ==================== GRADES ====================

@Controller('grades')
export class GradesController {
    constructor(private readonly gradesService: GradesService) { }

    @Post()
    @Roles(
        UserRole.SUPER_ADMIN,
        UserRole.ORG_ADMIN,
        UserRole.SCHOOL_ADMIN,
        UserRole.PRINCIPAL,
        UserRole.TEACHER,
    )
    async create(
        @Body() dto: CreateGradeDto,
        @CurrentUser() user: User,
    ): Promise<Grade> {
        return this.gradesService.enterGrade(dto, user.id);
    }

    @Post('bulk')
    @Roles(
        UserRole.SUPER_ADMIN,
        UserRole.ORG_ADMIN,
        UserRole.SCHOOL_ADMIN,
        UserRole.PRINCIPAL,
        UserRole.TEACHER,
    )
    async bulkCreate(
        @Body() dto: BulkGradeDto,
        @CurrentUser() user: User,
    ): Promise<{ created: number; updated: number }> {
        return this.gradesService.bulkEnterGrades(dto, user.id, user.schoolId);
    }

    @Get('student/:studentId')
    async getByStudent(
        @Param('studentId', ParseUUIDPipe) studentId: string,
        @Query('termId') termId?: string,
    ): Promise<Grade[]> {
        return this.gradesService.findGradesByStudent(studentId, termId);
    }

    @Patch(':id')
    @Roles(
        UserRole.SUPER_ADMIN,
        UserRole.ORG_ADMIN,
        UserRole.SCHOOL_ADMIN,
        UserRole.PRINCIPAL,
        UserRole.TEACHER,
    )
    async update(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() dto: UpdateGradeDto,
        @CurrentUser() user: User,
    ): Promise<Grade> {
        return this.gradesService.updateGrade(id, dto, user.id);
    }
}
