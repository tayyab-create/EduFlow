import {
    IsUUID,
    IsNotEmpty,
    IsString,
    IsOptional,
    MaxLength,
} from 'class-validator';

/**
 * DTO for creating a timetable entry (assigning subject/teacher to period).
 */
export class CreateTimetableEntryDto {
    @IsUUID()
    @IsNotEmpty()
    periodId: string;

    @IsUUID()
    @IsNotEmpty()
    sectionId: string;

    @IsUUID()
    @IsNotEmpty()
    subjectId: string;

    @IsUUID()
    @IsNotEmpty()
    teacherId: string;

    @IsUUID()
    @IsNotEmpty()
    academicYearId: string;

    @IsString()
    @MaxLength(50)
    @IsOptional()
    room?: string;

    @IsString()
    @MaxLength(500)
    @IsOptional()
    notes?: string;
}
