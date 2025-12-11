import {
    IsString,
    IsUUID,
    IsInt,
    IsOptional,
    MaxLength,
    Min,
} from 'class-validator';

/**
 * DTO for creating a section within a class.
 */
export class CreateSectionDto {
    @IsUUID()
    classId: string;

    @IsString()
    @MaxLength(10)
    name: string; // e.g., "A", "B", "Blue"

    @IsOptional()
    @IsString()
    @MaxLength(20)
    roomNumber?: string;

    @IsOptional()
    @IsInt()
    @Min(1)
    capacity?: number;

    @IsOptional()
    @IsUUID()
    classTeacherId?: string;
}
