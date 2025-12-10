import { PartialType } from '@nestjs/mapped-types';
import { CreateSchoolDto } from './create-school.dto';

/**
 * DTO for updating a school.
 */
export class UpdateSchoolDto extends PartialType(CreateSchoolDto) { }
