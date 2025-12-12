import { PartialType } from '@nestjs/mapped-types';
import { CreateTimetableEntryDto } from './create-timetable-entry.dto';
import { IsBoolean, IsOptional } from 'class-validator';

/**
 * DTO for updating a timetable entry.
 */
export class UpdateTimetableEntryDto extends PartialType(CreateTimetableEntryDto) {
    @IsBoolean()
    @IsOptional()
    isActive?: boolean;
}
