import {
    IsUUID,
    IsEnum,
    IsDateString,
    IsOptional,
    IsString,
    IsInt,
    Min,
    MaxLength,
} from 'class-validator';
import { AttendanceStatus } from '../entities/attendance.entity';

/**
 * DTO for marking individual student attendance.
 */
export class CreateAttendanceDto {
    @IsUUID()
    studentId: string;

    @IsUUID()
    sectionId: string;

    @IsDateString()
    date: string;

    @IsEnum(AttendanceStatus)
    status: AttendanceStatus;

    @IsOptional()
    @IsString()
    checkInTime?: string; // HH:mm format

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

    @IsOptional()
    @IsString()
    @MaxLength(100)
    clientId?: string; // For offline sync
}
