import {
    IsEnum,
    IsOptional,
    IsString,
    IsInt,
    Min,
    MaxLength,
} from 'class-validator';
import { AttendanceStatus } from '../entities/attendance.entity';

/**
 * DTO for updating/correcting attendance.
 * Requires a reason when correcting.
 */
export class UpdateAttendanceDto {
    @IsOptional()
    @IsEnum(AttendanceStatus)
    status?: AttendanceStatus;

    @IsOptional()
    @IsString()
    checkInTime?: string;

    @IsOptional()
    @IsString()
    checkOutTime?: string;

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
 * DTO for correcting attendance (requires reason).
 */
export class CorrectAttendanceDto {
    @IsEnum(AttendanceStatus)
    status: AttendanceStatus;

    @IsString()
    @MaxLength(500)
    correctionReason: string;

    @IsOptional()
    @IsString()
    @MaxLength(500)
    notes?: string;
}
