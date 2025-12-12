import {
    IsString,
    IsOptional,
    IsUUID,
    IsDateString,
} from 'class-validator';

/**
 * Query parameters for attendance summary report.
 */
export class AttendanceSummaryQueryDto {
    @IsDateString()
    startDate: string;

    @IsDateString()
    endDate: string;

    @IsUUID()
    @IsOptional()
    sectionId?: string;
}

/**
 * Query parameters for fee collection report.
 */
export class FeeCollectionQueryDto {
    @IsDateString()
    startDate: string;

    @IsDateString()
    endDate: string;
}

/**
 * Query parameters for class performance report.
 */
export class ClassPerformanceQueryDto {
    @IsUUID()
    assessmentId: string;
}
