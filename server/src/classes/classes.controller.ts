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
import { ClassesService } from './classes.service';
import {
    CreateClassDto,
    UpdateClassDto,
    CreateSectionDto,
    UpdateSectionDto,
    QueryClassesDto,
    QuerySectionsDto,
} from './dto';
import { Class, Section } from './entities';
import { PaginatedResponse } from '../common/dto/pagination.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { User, UserRole } from '../database/entities/user.entity';

@Controller('classes')
export class ClassesController {
    constructor(private readonly classesService: ClassesService) { }

    // ==================== CLASS ENDPOINTS ====================

    @Post()
    @Roles(
        UserRole.SUPER_ADMIN,
        UserRole.ORG_ADMIN,
        UserRole.SCHOOL_ADMIN,
        UserRole.PRINCIPAL,
    )
    async createClass(
        @Body() createDto: CreateClassDto,
        @CurrentUser() user: User,
    ): Promise<Class> {
        return this.classesService.createClass(createDto, user.schoolId);
    }

    @Get()
    async findAllClasses(
        @Query() query: QueryClassesDto,
        @CurrentUser() user: User,
    ): Promise<PaginatedResponse<Class>> {
        return this.classesService.findAllClasses(query, user.schoolId);
    }

    @Get(':id')
    async findOneClass(
        @Param('id', ParseUUIDPipe) id: string,
        @CurrentUser() user: User,
    ): Promise<Class> {
        return this.classesService.findOneClass(id, user.schoolId);
    }

    @Patch(':id')
    @Roles(
        UserRole.SUPER_ADMIN,
        UserRole.ORG_ADMIN,
        UserRole.SCHOOL_ADMIN,
        UserRole.PRINCIPAL,
    )
    async updateClass(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() updateDto: UpdateClassDto,
        @CurrentUser() user: User,
    ): Promise<Class> {
        return this.classesService.updateClass(id, updateDto, user.schoolId);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @Roles(UserRole.SUPER_ADMIN, UserRole.ORG_ADMIN, UserRole.SCHOOL_ADMIN)
    async removeClass(
        @Param('id', ParseUUIDPipe) id: string,
        @CurrentUser() user: User,
    ): Promise<void> {
        return this.classesService.removeClass(id, user.schoolId);
    }

    // ==================== SECTION ENDPOINTS ====================

    @Post(':classId/sections')
    @Roles(
        UserRole.SUPER_ADMIN,
        UserRole.ORG_ADMIN,
        UserRole.SCHOOL_ADMIN,
        UserRole.PRINCIPAL,
    )
    async createSection(
        @Param('classId', ParseUUIDPipe) classId: string,
        @Body() createDto: CreateSectionDto,
        @CurrentUser() user: User,
    ): Promise<Section> {
        // Override classId from URL for security
        return this.classesService.createSection(
            { ...createDto, classId },
            user.schoolId,
        );
    }

    @Get(':classId/sections')
    async getSectionsByClass(
        @Param('classId', ParseUUIDPipe) classId: string,
        @CurrentUser() user: User,
    ): Promise<Section[]> {
        return this.classesService.getSectionsByClass(classId, user.schoolId);
    }
}

@Controller('sections')
export class SectionsController {
    constructor(private readonly classesService: ClassesService) { }

    @Get()
    async findAllSections(
        @Query() query: QuerySectionsDto,
        @CurrentUser() user: User,
    ): Promise<PaginatedResponse<Section>> {
        return this.classesService.findAllSections(query, user.schoolId);
    }

    @Get(':id')
    async findOneSection(
        @Param('id', ParseUUIDPipe) id: string,
        @CurrentUser() user: User,
    ): Promise<Section> {
        return this.classesService.findOneSection(id, user.schoolId);
    }

    @Patch(':id')
    @Roles(
        UserRole.SUPER_ADMIN,
        UserRole.ORG_ADMIN,
        UserRole.SCHOOL_ADMIN,
        UserRole.PRINCIPAL,
    )
    async updateSection(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() updateDto: UpdateSectionDto,
        @CurrentUser() user: User,
    ): Promise<Section> {
        return this.classesService.updateSection(id, updateDto, user.schoolId);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @Roles(UserRole.SUPER_ADMIN, UserRole.ORG_ADMIN, UserRole.SCHOOL_ADMIN)
    async removeSection(
        @Param('id', ParseUUIDPipe) id: string,
        @CurrentUser() user: User,
    ): Promise<void> {
        return this.classesService.removeSection(id, user.schoolId);
    }
}
