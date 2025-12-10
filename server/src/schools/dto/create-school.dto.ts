import {
    IsString,
    IsOptional,
    IsEmail,
    IsUrl,
    IsBoolean,
    MaxLength,
    IsObject,
} from 'class-validator';

/**
 * DTO for creating a new school.
 */
export class CreateSchoolDto {
    @IsString()
    @MaxLength(255)
    name: string;

    @IsOptional()
    @IsString()
    @MaxLength(255)
    nameUrdu?: string;

    @IsString()
    @MaxLength(50)
    code: string;

    @IsOptional()
    @IsString()
    @MaxLength(500)
    logoUrl?: string;

    @IsOptional()
    @IsString()
    address?: string;

    @IsOptional()
    @IsString()
    @MaxLength(100)
    city?: string;

    @IsOptional()
    @IsString()
    @MaxLength(100)
    district?: string;

    @IsOptional()
    @IsString()
    @MaxLength(100)
    province?: string;

    @IsOptional()
    @IsString()
    @MaxLength(20)
    postalCode?: string;

    @IsOptional()
    @IsString()
    @MaxLength(20)
    phone?: string;

    @IsOptional()
    @IsEmail()
    @MaxLength(255)
    email?: string;

    @IsOptional()
    @IsUrl()
    @MaxLength(255)
    website?: string;

    @IsOptional()
    @IsString()
    @MaxLength(7)
    primaryColor?: string;

    @IsOptional()
    @IsString()
    @MaxLength(7)
    secondaryColor?: string;

    @IsOptional()
    @IsString()
    @MaxLength(20)
    subscriptionTier?: string;

    @IsOptional()
    @IsObject()
    settings?: Record<string, any>;
}
