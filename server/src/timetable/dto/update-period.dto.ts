import { PartialType } from '@nestjs/mapped-types';
import { CreatePeriodDto } from './create-period.dto';
import { IsBoolean, IsOptional } from 'class-validator';

/**
 * DTO for updating a period.
 */
export class UpdatePeriodDto extends PartialType(CreatePeriodDto) {
    @IsBoolean()
    @IsOptional()
    isActive?: boolean;
}
