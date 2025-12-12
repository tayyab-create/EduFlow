import {
    IsString,
    IsNotEmpty,
    IsEnum,
    IsOptional,
    IsUUID,
    IsArray,
    IsBoolean,
    IsDateString,
    MaxLength,
} from 'class-validator';
import { AnnouncementPriority } from '../entities/announcement.entity';

/**
 * DTO for creating an announcement.
 */
export class CreateAnnouncementDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(200)
    title: string;

    @IsString()
    @IsNotEmpty()
    content: string;

    @IsEnum(AnnouncementPriority)
    @IsOptional()
    priority?: AnnouncementPriority;

    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    targetRoles?: string[];

    @IsArray()
    @IsUUID('4', { each: true })
    @IsOptional()
    targetClassIds?: string[];

    @IsArray()
    @IsOptional()
    attachments?: Array<{
        url: string;
        name: string;
        type: string;
        size: number;
    }>;

    @IsDateString()
    @IsOptional()
    expiresAt?: string;

    @IsBoolean()
    @IsOptional()
    isPinned?: boolean;

    @IsBoolean()
    @IsOptional()
    isDraft?: boolean;
}

/**
 * DTO for updating an announcement.
 */
export class UpdateAnnouncementDto {
    @IsString()
    @MaxLength(200)
    @IsOptional()
    title?: string;

    @IsString()
    @IsOptional()
    content?: string;

    @IsEnum(AnnouncementPriority)
    @IsOptional()
    priority?: AnnouncementPriority;

    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    targetRoles?: string[];

    @IsArray()
    @IsUUID('4', { each: true })
    @IsOptional()
    targetClassIds?: string[];

    @IsDateString()
    @IsOptional()
    expiresAt?: string;

    @IsBoolean()
    @IsOptional()
    isPinned?: boolean;

    @IsBoolean()
    @IsOptional()
    isDraft?: boolean;
}
