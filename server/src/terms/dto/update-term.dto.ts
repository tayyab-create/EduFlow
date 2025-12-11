import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateTermDto } from './create-term.dto';

/**
 * DTO for updating a term.
 * Cannot change academicYearId or termNumber after creation.
 */
export class UpdateTermDto extends PartialType(
    OmitType(CreateTermDto, ['academicYearId', 'termNumber'] as const),
) { }
