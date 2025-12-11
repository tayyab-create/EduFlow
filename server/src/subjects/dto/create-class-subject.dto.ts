import { IsUUID, IsInt, IsOptional, Min } from 'class-validator';

/**
 * DTO for assigning a subject to a class with a teacher.
 */
export class CreateClassSubjectDto {
    @IsUUID()
    classId: string;

    @IsUUID()
    subjectId: string;

    @IsOptional()
    @IsUUID()
    teacherId?: string;

    @IsOptional()
    @IsInt()
    @Min(1)
    periodsPerWeek?: number;
}
