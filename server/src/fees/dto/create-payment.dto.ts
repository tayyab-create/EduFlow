import {
    IsUUID,
    IsNumber,
    IsEnum,
    IsString,
    IsDateString,
    IsOptional,
    Min,
    MaxLength,
} from 'class-validator';
import { PaymentMethod } from '../entities/payment.entity';

export class CreatePaymentDto {
    @IsUUID()
    studentId: string;

    @IsOptional()
    @IsUUID()
    studentFeeId?: string;

    @IsNumber()
    @Min(0)
    amount: number;

    @IsEnum(PaymentMethod)
    paymentMethod: PaymentMethod;

    @IsDateString()
    paymentDate: string;

    @IsOptional()
    @IsString()
    @MaxLength(100)
    referenceNumber?: string;

    @IsOptional()
    @IsString()
    @MaxLength(50)
    chequeNumber?: string;

    @IsOptional()
    @IsString()
    @MaxLength(100)
    bankName?: string;

    @IsOptional()
    @IsString()
    notes?: string;
}
