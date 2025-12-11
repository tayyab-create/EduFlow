import {
    IsString,
    IsDateString,
    IsBoolean,
    IsOptional,
    MaxLength,
    Matches,
} from 'class-validator';

/**
 * DTO for creating an academic year.
 */
export class CreateAcademicYearDto {
    @IsString()
    @MaxLength(50)
    @Matches(/^\d{4}-\d{4}$/, {
        message: 'Name must be in format YYYY-YYYY (e.g., 2024-2025)',
    })
    name: string;

    @IsDateString()
    startDate: string;

    @IsDateString()
    endDate: string;

    @IsOptional()
    @IsBoolean()
    isCurrent?: boolean;
}
