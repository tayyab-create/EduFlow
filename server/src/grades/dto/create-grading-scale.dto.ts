import {
    IsString,
    IsArray,
    IsNumber,
    IsBoolean,
    IsOptional,
    MaxLength,
    Min,
    Max,
    ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

/**
 * Grade definition within a grading scale.
 */
export class GradeDefinitionDto {
    @IsString()
    @MaxLength(5)
    grade: string; // e.g., "A+", "A", "B"

    @IsNumber()
    @Min(0)
    @Max(100)
    minPercentage: number;

    @IsNumber()
    @Min(0)
    @Max(100)
    maxPercentage: number;

    @IsOptional()
    @IsNumber()
    @Min(0)
    @Max(4)
    gpaPoints?: number;

    @IsOptional()
    @IsString()
    description?: string;
}

/**
 * DTO for creating a grading scale.
 */
export class CreateGradingScaleDto {
    @IsString()
    @MaxLength(100)
    name: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => GradeDefinitionDto)
    grades: GradeDefinitionDto[];

    @IsOptional()
    @IsNumber()
    @Min(0)
    @Max(100)
    passingPercentage?: number;

    @IsOptional()
    @IsBoolean()
    isDefault?: boolean;
}
