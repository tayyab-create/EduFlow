import {
    IsString,
    IsUUID,
    IsEnum,
    IsNumber,
    IsDateString,
    IsBoolean,
    IsOptional,
    MaxLength,
    Min,
} from 'class-validator';
import { AssessmentType } from '../entities/grading-scale.entity';

/**
 * DTO for creating an assessment.
 */
export class CreateAssessmentDto {
    @IsUUID()
    sectionId: string;

    @IsUUID()
    subjectId: string;

    @IsOptional()
    @IsUUID()
    termId?: string;

    @IsString()
    @MaxLength(200)
    name: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsEnum(AssessmentType)
    type: AssessmentType;

    @IsNumber()
    @Min(0)
    totalMarks: number;

    @IsOptional()
    @IsNumber()
    @Min(0)
    weightage?: number;

    @IsDateString()
    assessmentDate: string;

    @IsOptional()
    @IsDateString()
    dueDate?: string;
}
