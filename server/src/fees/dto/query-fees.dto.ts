import { IsOptional, IsUUID, IsEnum, IsInt, Min, Max } from 'class-validator';
import { Transform } from 'class-transformer';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { StudentFeeStatus } from '../entities/student-fee.entity';

export class QueryStudentFeesDto extends PaginationDto {
    @IsOptional()
    @IsUUID()
    studentId?: string;

    @IsOptional()
    @IsUUID()
    classId?: string;

    @IsOptional()
    @IsUUID()
    sectionId?: string;

    @IsOptional()
    @IsEnum(StudentFeeStatus)
    status?: StudentFeeStatus;

    @IsOptional()
    @IsInt()
    @Min(1)
    @Max(12)
    @Transform(({ value }) => parseInt(value))
    month?: number;

    @IsOptional()
    @IsInt()
    @Min(2020)
    @Transform(({ value }) => parseInt(value))
    year?: number;
}

export class QueryPaymentsDto extends PaginationDto {
    @IsOptional()
    @IsUUID()
    studentId?: string;

    @IsOptional()
    @IsInt()
    @Min(1)
    @Max(12)
    @Transform(({ value }) => parseInt(value))
    month?: number;

    @IsOptional()
    @IsInt()
    @Min(2020)
    @Transform(({ value }) => parseInt(value))
    year?: number;
}
