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
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto } from './dto';
import { User, UserRole } from '../database/entities/user.entity';
import { Roles, CurrentUser } from '../common/decorators';
import { RolesGuard } from '../common/guards';

/**
 * Users controller with hierarchical access control.
 * Only admins can create/manage users.
 */
@Controller('api/v1/users')
@UseGuards(RolesGuard)
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    /**
     * Create a new user (hierarchical permission check).
     */
    @Post()
    @Roles(UserRole.SUPER_ADMIN, UserRole.ORG_ADMIN, UserRole.SCHOOL_ADMIN)
    async create(
        @CurrentUser() creator: User,
        @Body() dto: CreateUserDto,
    ): Promise<User> {
        return this.usersService.create(creator, dto);
    }

    /**
     * List all users (filtered by scope).
     */
    @Get()
    @Roles(UserRole.SUPER_ADMIN, UserRole.ORG_ADMIN, UserRole.SCHOOL_ADMIN)
    async findAll(@CurrentUser() creator: User): Promise<User[]> {
        return this.usersService.findAll(creator);
    }

    /**
     * Get user by ID.
     */
    @Get(':id')
    @Roles(UserRole.SUPER_ADMIN, UserRole.ORG_ADMIN, UserRole.SCHOOL_ADMIN)
    async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<User> {
        return this.usersService.findOne(id);
    }

    /**
     * Update user.
     */
    @Patch(':id')
    @Roles(UserRole.SUPER_ADMIN, UserRole.ORG_ADMIN, UserRole.SCHOOL_ADMIN)
    async update(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() dto: UpdateUserDto,
    ): Promise<User> {
        return this.usersService.update(id, dto);
    }

    /**
     * Deactivate user.
     */
    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @Roles(UserRole.SUPER_ADMIN, UserRole.ORG_ADMIN, UserRole.SCHOOL_ADMIN)
    async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
        return this.usersService.remove(id);
    }
}
