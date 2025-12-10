import {
    IsString,
    IsOptional,
    IsEmail,
    IsUrl,
    IsInt,
    Min,
    MaxLength,
} from 'class-validator';

/**
 * DTO for creating an organization.
 */
export class CreateOrganizationDto {
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
    headquartersAddress?: string;

    @IsOptional()
    @IsString()
    @MaxLength(100)
    city?: string;

    @IsOptional()
    @IsString()
    @MaxLength(100)
    country?: string;

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
    @IsInt()
    @Min(1)
    maxSchools?: number;
}
