import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { DayOfWeek } from '../entities/period.entity';

/**
 * Query parameters for fetching schedule.
 */
export class QueryScheduleDto extends PaginationDto {
    @IsEnum(DayOfWeek)
    @IsOptional()
    dayOfWeek?: DayOfWeek;

    @IsUUID()
    @IsOptional()
    academicYearId?: string;
}

/**
 * Query parameters for fetching periods.
 */
export class QueryPeriodsDto extends PaginationDto {
    @IsEnum(DayOfWeek)
    @IsOptional()
    dayOfWeek?: DayOfWeek;
}
