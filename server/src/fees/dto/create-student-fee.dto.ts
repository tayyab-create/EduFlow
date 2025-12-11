import {
    IsUUID,
    IsNumber,
    IsString,
    IsInt,
    IsOptional,
    Min,
    Max,
    MaxLength,
} from 'class-validator';

/**
 * DTO for generating student fees for a class/section.
 */
export class GenerateStudentFeesDto {
    @IsUUID()
    feeStructureId: string;

    @IsOptional()
    @IsUUID()
    sectionId?: string; // If not provided, generates for all sections in class

    @IsInt()
    @Min(1)
    @Max(12)
    month: number;

    @IsInt()
    @Min(2020)
    year: number;

    @IsOptional()
    @IsUUID()
    termId?: string;
}

/**
 * DTO for applying discount to a student fee.
 */
export class ApplyDiscountDto {
    @IsNumber()
    @Min(0)
    discountAmount: number;

    @IsOptional()
    @IsString()
    @MaxLength(255)
    discountReason?: string;
}

/**
 * DTO for waiving a student fee.
 */
export class WaiveFeeDto {
    @IsString()
    @MaxLength(500)
    reason: string;
}
