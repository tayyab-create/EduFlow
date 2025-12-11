import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateGradingScaleDto } from './create-grading-scale.dto';
import { CreateAssessmentDto } from './create-assessment.dto';
import { CreateGradeDto } from './create-grade.dto';

export class UpdateGradingScaleDto extends PartialType(CreateGradingScaleDto) { }

export class UpdateAssessmentDto extends PartialType(
    OmitType(CreateAssessmentDto, ['sectionId', 'subjectId'] as const),
) { }

export class UpdateGradeDto extends PartialType(
    OmitType(CreateGradeDto, ['assessmentId', 'studentId'] as const),
) { }
