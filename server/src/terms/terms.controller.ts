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
import { TermsService } from './terms.service';
import { CreateTermDto, UpdateTermDto, QueryTermsDto } from './dto';
import { Term } from './entities/term.entity';
import { PaginatedResponse } from '../common/dto/pagination.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { User, UserRole } from '../database/entities/user.entity';

@Controller('terms')
export class TermsController {
    constructor(private readonly termsService: TermsService) { }

    @Post()
    @Roles(
        UserRole.SUPER_ADMIN,
        UserRole.ORG_ADMIN,
        UserRole.SCHOOL_ADMIN,
        UserRole.PRINCIPAL,
    )
    async create(
        @Body() createDto: CreateTermDto,
        @CurrentUser() user: User,
    ): Promise<Term> {
        return this.termsService.create(createDto, user.schoolId);
    }

    @Get()
    async findAll(
        @Query() query: QueryTermsDto,
        @CurrentUser() user: User,
    ): Promise<PaginatedResponse<Term>> {
        return this.termsService.findAll(query, user.schoolId);
    }

    @Get('current')
    async findCurrent(@CurrentUser() user: User): Promise<Term | null> {
        return this.termsService.findCurrent(user.schoolId);
    }

    @Get('academic-year/:academicYearId')
    async getByAcademicYear(
        @Param('academicYearId', ParseUUIDPipe) academicYearId: string,
        @CurrentUser() user: User,
    ): Promise<Term[]> {
        return this.termsService.getByAcademicYear(academicYearId, user.schoolId);
    }

    @Get(':id')
    async findOne(
        @Param('id', ParseUUIDPipe) id: string,
        @CurrentUser() user: User,
    ): Promise<Term> {
        return this.termsService.findOne(id, user.schoolId);
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
        @Body() updateDto: UpdateTermDto,
        @CurrentUser() user: User,
    ): Promise<Term> {
        return this.termsService.update(id, updateDto, user.schoolId);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @Roles(UserRole.SUPER_ADMIN, UserRole.ORG_ADMIN, UserRole.SCHOOL_ADMIN)
    async remove(
        @Param('id', ParseUUIDPipe) id: string,
        @CurrentUser() user: User,
    ): Promise<void> {
        return this.termsService.remove(id, user.schoolId);
    }

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
    ): Promise<Term> {
        return this.termsService.setCurrent(id, user.schoolId);
    }

    @Post(':id/publish-results')
    @Roles(
        UserRole.SUPER_ADMIN,
        UserRole.ORG_ADMIN,
        UserRole.SCHOOL_ADMIN,
        UserRole.PRINCIPAL,
    )
    async publishResults(
        @Param('id', ParseUUIDPipe) id: string,
        @CurrentUser() user: User,
    ): Promise<Term> {
        return this.termsService.publishResults(id, user.schoolId);
    }
}
