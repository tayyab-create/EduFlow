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
import { OrganizationsService } from './organizations.service';
import { CreateOrganizationDto, UpdateOrganizationDto } from './dto';
import { Organization } from '../database/entities/organization.entity';
import { Roles } from '../common/decorators';
import { RolesGuard } from '../common/guards';
import { UserRole } from '../database/entities/user.entity';

/**
 * Controller for organization management.
 * Super Admin only access.
 */
@Controller('api/v1/organizations')
@UseGuards(RolesGuard)
export class OrganizationsController {
    constructor(private readonly orgsService: OrganizationsService) { }

    /**
     * Create a new organization.
     */
    @Post()
    @Roles(UserRole.SUPER_ADMIN)
    async create(@Body() dto: CreateOrganizationDto): Promise<Organization> {
        return this.orgsService.create(dto);
    }

    /**
     * Get all organizations.
     */
    @Get()
    @Roles(UserRole.SUPER_ADMIN)
    async findAll(): Promise<Organization[]> {
        return this.orgsService.findAll();
    }

    /**
     * Get an organization by ID.
     */
    @Get(':id')
    @Roles(UserRole.SUPER_ADMIN, UserRole.ORG_ADMIN)
    async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Organization> {
        return this.orgsService.findOne(id);
    }

    /**
     * Update an organization.
     */
    @Patch(':id')
    @Roles(UserRole.SUPER_ADMIN)
    async update(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() dto: UpdateOrganizationDto,
    ): Promise<Organization> {
        return this.orgsService.update(id, dto);
    }

    /**
     * Delete an organization.
     */
    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @Roles(UserRole.SUPER_ADMIN)
    async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
        return this.orgsService.remove(id);
    }
}
