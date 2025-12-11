import {
    IsUUID,
    IsNumber,
    IsString,
    IsBoolean,
    IsOptional,
    MaxLength,
    Min,
    IsArray,
    ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO for entering a single student's grade.
 */
export class CreateGradeDto {
    @IsUUID()
    assessmentId: string;

    @IsUUID()
    studentId: string;

    @IsOptional()
    @IsNumber()
    @Min(0)
    marksObtained?: number;

    @IsOptional()
    @IsBoolean()
    isAbsent?: boolean;

    @IsOptional()
    @IsBoolean()
    isExempt?: boolean;

    @IsOptional()
    @IsString()
    @MaxLength(500)
    remarks?: string;
}

/**
 * Individual grade entry for bulk grading.
 */
export class BulkGradeEntryDto {
    @IsUUID()
    studentId: string;

    @IsOptional()
    @IsNumber()
    @Min(0)
    marksObtained?: number;

    @IsOptional()
    @IsBoolean()
    isAbsent?: boolean;

    @IsOptional()
    @IsBoolean()
    isExempt?: boolean;

    @IsOptional()
    @IsString()
    @MaxLength(500)
    remarks?: string;
}

/**
 * DTO for bulk grade entry (entire assessment at once).
 */
export class BulkGradeDto {
    @IsUUID()
    assessmentId: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => BulkGradeEntryDto)
    grades: BulkGradeEntryDto[];
}
