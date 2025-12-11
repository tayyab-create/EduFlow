import {
    IsString,
    IsUUID,
    IsInt,
    IsOptional,
    MaxLength,
    Min,
} from 'class-validator';

/**
 * DTO for creating a class.
 */
export class CreateClassDto {
    @IsUUID()
    academicYearId: string;

    @IsString()
    @MaxLength(50)
    name: string; // e.g., "Class 5", "Grade 10"

    @IsOptional()
    @IsInt()
    @Min(1)
    gradeLevel?: number;

    @IsOptional()
    @IsInt()
    @Min(0)
    displayOrder?: number;
}
