import { IsOptional, IsInt, Min, Max, IsString, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * Reusable pagination query parameters.
 * Supports page-based pagination with sorting.
 */
export class PaginationDto {
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page: number = 1;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(100)
    limit: number = 10;

    @IsOptional()
    @IsString()
    sortBy: string = 'createdAt';

    @IsOptional()
    @IsIn(['ASC', 'DESC', 'asc', 'desc'])
    sortOrder: 'ASC' | 'DESC' | 'asc' | 'desc' = 'DESC';

    get skip(): number {
        return (this.page - 1) * this.limit;
    }

    get take(): number {
        return this.limit;
    }

    get order(): 'ASC' | 'DESC' {
        return this.sortOrder.toUpperCase() as 'ASC' | 'DESC';
    }
}

/**
 * Paginated response wrapper.
 */
export interface PaginatedResponse<T> {
    data: T[];
    meta: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
    };
}

/**
 * Helper to create paginated response.
 */
export function createPaginatedResponse<T>(
    data: T[],
    total: number,
    pagination: PaginationDto,
): PaginatedResponse<T> {
    const totalPages = Math.ceil(total / pagination.limit);
    return {
        data,
        meta: {
            page: pagination.page,
            limit: pagination.limit,
            total,
            totalPages,
            hasNext: pagination.page < totalPages,
            hasPrev: pagination.page > 1,
        },
    };
}
