import { PartialType } from '@nestjs/mapped-types';
import { CreateStudentDto } from './create-student.dto';

/**
 * DTO for updating a student.
 * All fields are optional (partial update).
 */
export class UpdateStudentDto extends PartialType(CreateStudentDto) { }
