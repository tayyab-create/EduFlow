import {
    IsUUID,
    IsNumber,
    IsInt,
    IsBoolean,
    IsOptional,
    Min,
    Max,
} from 'class-validator';

export class CreateFeeStructureDto {
    @IsUUID()
    feeTypeId: string;

    @IsUUID()
    classId: string;

    @IsUUID()
    academicYearId: string;

    @IsNumber()
    @Min(0)
    amount: number;

    @IsOptional()
    @IsInt()
    @Min(1)
    @Max(28)
    dueDay?: number;

    @IsOptional()
    @IsNumber()
    @Min(0)
    lateFeePercentage?: number;

    @IsOptional()
    @IsNumber()
    @Min(0)
    lateFeeFixed?: number;

    @IsOptional()
    @IsBoolean()
    discountAvailable?: boolean;
}
