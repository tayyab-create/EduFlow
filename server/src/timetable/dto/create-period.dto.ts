import {
    IsString,
    IsNotEmpty,
    IsEnum,
    IsInt,
    IsBoolean,
    IsOptional,
    Min,
    Max,
    Matches,
} from 'class-validator';
import { DayOfWeek } from '../entities/period.entity';

/**
 * DTO for creating a new period (time slot).
 */
export class CreatePeriodDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    /**
     * Start time in HH:MM format (24-hour).
     * Example: "08:00", "14:30"
     */
    @IsString()
    @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
        message: 'startTime must be in HH:MM format (24-hour)',
    })
    startTime: string;

    /**
     * End time in HH:MM format (24-hour).
     */
    @IsString()
    @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
        message: 'endTime must be in HH:MM format (24-hour)',
    })
    endTime: string;

    @IsEnum(DayOfWeek)
    dayOfWeek: DayOfWeek;

    @IsInt()
    @Min(1)
    @Max(20)
    order: number;

    @IsBoolean()
    @IsOptional()
    isBreak?: boolean;

    @IsInt()
    @Min(5)
    @Max(180)
    @IsOptional()
    durationMinutes?: number;
}
