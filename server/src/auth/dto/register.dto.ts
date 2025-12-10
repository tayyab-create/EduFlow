import { IsEmail, IsNotEmpty, IsString, MinLength, IsOptional, IsEnum, IsUUID, ValidateIf } from 'class-validator';
import { UserRole } from '../../database/entities/user.entity';

export class RegisterDto {
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(8, { message: 'Password must be at least 8 characters long' })
    password: string;

    @IsString()
    @IsNotEmpty()
    firstName: string;

    @IsString()
    @IsNotEmpty()
    lastName: string;

    @IsString()
    @IsOptional()
    phone?: string;

    @IsEnum(UserRole)
    @IsOptional()
    role?: UserRole;

    /**
     * Direct school ID assignment (for Super Admin creating users)
     */
    @IsUUID()
    @IsOptional()
    schoolId?: string;

    /**
     * School code to join an existing school (for self-registration)
     */
    @IsString()
    @IsOptional()
    schoolCode?: string;

    /**
     * For school admin registration - creates new school with this name
     */
    @IsString()
    @IsOptional()
    schoolName?: string;
}
