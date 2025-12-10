import { IsOptional, IsString, IsEnum, IsUUID } from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { StudentStatus } from '../entities/student.entity';

/**
 * DTO for querying/filtering students.
 * Extends PaginationDto for pagination support.
 */
export class QueryStudentsDto extends PaginationDto {
    @IsOptional()
    @IsString()
    search?: string; // Searches firstName, lastName, registrationNo

    @IsOptional()
    @IsEnum(StudentStatus)
    status?: StudentStatus;

    @IsOptional()
    @IsUUID()
    sectionId?: string;

    @IsOptional()
    @IsString()
    gender?: string;

    @IsOptional()
    @IsString()
    city?: string;
}
