import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateFeeTypeDto } from './create-fee-type.dto';
import { CreateFeeStructureDto } from './create-fee-structure.dto';

export class UpdateFeeTypeDto extends PartialType(CreateFeeTypeDto) { }

export class UpdateFeeStructureDto extends PartialType(
    OmitType(CreateFeeStructureDto, ['feeTypeId', 'classId', 'academicYearId'] as const),
) { }
