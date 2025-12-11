import {
    IsString,
    IsBoolean,
    IsOptional,
    MaxLength,
} from 'class-validator';

/**
 * DTO for creating a subject.
 */
export class CreateSubjectDto {
    @IsString()
    @MaxLength(100)
    name: string;

    @IsOptional()
    @IsString()
    @MaxLength(100)
    nameUrdu?: string;

    @IsOptional()
    @IsString()
    @MaxLength(20)
    code?: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsBoolean()
    isMandatory?: boolean;

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}
