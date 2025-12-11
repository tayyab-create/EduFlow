import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateSectionDto } from './create-section.dto';

/**
 * DTO for updating a section.
 * classId cannot be changed after creation.
 */
export class UpdateSectionDto extends PartialType(
    OmitType(CreateSectionDto, ['classId'] as const),
) { }
