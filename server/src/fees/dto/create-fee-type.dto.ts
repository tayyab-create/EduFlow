import {
    IsString,
    IsEnum,
    IsBoolean,
    IsOptional,
    IsInt,
    MaxLength,
    Min,
} from 'class-validator';
import { FeeFrequency } from '../entities/fee-type.entity';

export class CreateFeeTypeDto {
    @IsString()
    @MaxLength(100)
    name: string;

    @IsOptional()
    @IsString()
    @MaxLength(100)
    nameUrdu?: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsEnum(FeeFrequency)
    frequency: FeeFrequency;

    @IsOptional()
    @IsBoolean()
    isOptional?: boolean;

    @IsOptional()
    @IsBoolean()
    isRefundable?: boolean;

    @IsOptional()
    @IsInt()
    @Min(0)
    displayOrder?: number;
}
