import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../../database/entities/user.entity';

export const ROLES_KEY = 'roles';

/**
 * Decorator to specify which roles can access a route.
 * 
 * @example
 * @Roles(UserRole.SCHOOL_ADMIN, UserRole.PRINCIPAL)
 * @Get('students')
 * findAll() { ... }
 */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
