import { IsOptional, IsUUID, IsDateString, IsEnum } from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { AttendanceStatus } from '../entities/attendance.entity';

/**
 * DTO for querying attendance records with filters.
 */
export class QueryAttendanceDto extends PaginationDto {
    @IsOptional()
    @IsUUID()
    sectionId?: string;

    @IsOptional()
    @IsUUID()
    studentId?: string;

    @IsOptional()
    @IsDateString()
    date?: string;

    @IsOptional()
    @IsDateString()
    startDate?: string;

    @IsOptional()
    @IsDateString()
    endDate?: string;

    @IsOptional()
    @IsEnum(AttendanceStatus)
    status?: AttendanceStatus;
}

/**
 * DTO for attendance report queries.
 */
export class AttendanceReportDto {
    @IsUUID()
    sectionId: string;

    @IsDateString()
    startDate: string;

    @IsDateString()
    endDate: string;
}
