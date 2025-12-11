import { PartialType } from '@nestjs/mapped-types';
import { CreateAcademicYearDto } from './create-academic-year.dto';

/**
 * DTO for updating an academic year.
 * All fields are optional.
 */
export class UpdateAcademicYearDto extends PartialType(CreateAcademicYearDto) { }
