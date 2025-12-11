import { IsOptional, IsUUID, IsEnum, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { AssessmentType } from '../entities/grading-scale.entity';

export class QueryAssessmentsDto extends PaginationDto {
    @IsOptional()
    @IsUUID()
    sectionId?: string;

    @IsOptional()
    @IsUUID()
    subjectId?: string;

    @IsOptional()
    @IsUUID()
    termId?: string;

    @IsOptional()
    @IsEnum(AssessmentType)
    type?: AssessmentType;

    @IsOptional()
    @IsBoolean()
    @Transform(({ value }) => value === 'true' || value === true)
    isGraded?: boolean;

    @IsOptional()
    @IsBoolean()
    @Transform(({ value }) => value === 'true' || value === true)
    isPublished?: boolean;
}

export class QueryGradesDto extends PaginationDto {
    @IsOptional()
    @IsUUID()
    assessmentId?: string;

    @IsOptional()
    @IsUUID()
    studentId?: string;
}
