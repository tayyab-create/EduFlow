import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateClassDto } from './create-class.dto';

/**
 * DTO for updating a class.
 * academicYearId cannot be changed after creation.
 */
export class UpdateClassDto extends PartialType(
    OmitType(CreateClassDto, ['academicYearId'] as const),
) { }
