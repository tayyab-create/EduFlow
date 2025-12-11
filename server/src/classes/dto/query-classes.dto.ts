import { IsOptional, IsUUID } from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';

/**
 * DTO for querying classes with filters.
 */
export class QueryClassesDto extends PaginationDto {
    @IsOptional()
    @IsUUID()
    academicYearId?: string;
}

/**
 * DTO for querying sections with filters.
 */
export class QuerySectionsDto extends PaginationDto {
    @IsOptional()
    @IsUUID()
    classId?: string;
}
