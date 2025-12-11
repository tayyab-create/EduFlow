import {
    IsString,
    IsEmail,
    IsOptional,
    IsEnum,
    IsUUID,
    MinLength,
} from 'class-validator';
import { UserRole } from '../../database/entities/user.entity';

/**
 * DTO for creating a user via admin hierarchy.
 * Different from registration - enforces parent-child creation rules.
 */
export class CreateUserDto {
    @IsEmail()
    email: string;

    @IsString()
    @MinLength(8)
    password: string;

    @IsString()
    firstName: string;

    @IsString()
    lastName: string;

    @IsEnum(UserRole)
    role: UserRole;

    @IsOptional()
    @IsString()
    phone?: string;

    /**
     * Required for org_admin role
     */
    @IsOptional()
    @IsUUID()
    organizationId?: string;

    /**
     * Required for school-level roles (school_admin, principal, teacher, etc.)
     */
    @IsOptional()
    @IsUUID()
    schoolId?: string;
}
