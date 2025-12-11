import {
    IsUUID,
    IsEnum,
    IsDateString,
    IsOptional,
    IsString,
    IsInt,
    Min,
    MaxLength,
    IsArray,
    ValidateNested,
    ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';
import { AttendanceStatus } from '../entities/attendance.entity';

/**
 * Individual student attendance record for bulk marking.
 */
export class StudentAttendanceDto {
    @IsUUID()
    studentId: string;

    @IsEnum(AttendanceStatus)
    status: AttendanceStatus;

    @IsOptional()
    @IsString()
    checkInTime?: string;

    @IsOptional()
    @IsInt()
    @Min(0)
    lateMinutes?: number;

    @IsOptional()
    @IsString()
    @MaxLength(500)
    notes?: string;
}

/**
 * DTO for bulk attendance marking (entire section at once).
 * This is the primary use case - teacher marks all students in ~30 seconds.
 */
export class BulkAttendanceDto {
    @IsUUID()
    sectionId: string;

    @IsDateString()
    date: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => StudentAttendanceDto)
    @ArrayMinSize(1)
    attendanceRecords: StudentAttendanceDto[];

    @IsOptional()
    @IsString()
    @MaxLength(100)
    clientId?: string; // For offline sync conflict resolution
}

/**
 * Quick bulk marking - mark all present except specified absentees.
 * This enables the "Mark All Present" -> "Tap Exceptions" flow.
 */
export class QuickBulkAttendanceDto {
    @IsUUID()
    sectionId: string;

    @IsDateString()
    date: string;

    @IsOptional()
    @IsArray()
    @IsUUID('4', { each: true })
    absentStudentIds?: string[];

    @IsOptional()
    @IsArray()
    @IsUUID('4', { each: true })
    lateStudentIds?: string[];

    @IsOptional()
    @IsString()
    @MaxLength(100)
    clientId?: string;
}
