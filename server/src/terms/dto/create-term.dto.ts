import {
    IsString,
    IsUUID,
    IsInt,
    IsDateString,
    IsBoolean,
    IsOptional,
    MaxLength,
    Min,
    Max,
} from 'class-validator';

/**
 * DTO for creating a term.
 */
export class CreateTermDto {
    @IsUUID()
    academicYearId: string;

    @IsString()
    @MaxLength(100)
    name: string; // e.g., "First Term", "Mid-Year"

    @IsInt()
    @Min(1)
    @Max(10)
    termNumber: number;

    @IsDateString()
    startDate: string;

    @IsDateString()
    endDate: string;

    @IsOptional()
    @IsDateString()
    resultPublishDate?: string;

    @IsOptional()
    @IsBoolean()
    isCurrent?: boolean;
}
