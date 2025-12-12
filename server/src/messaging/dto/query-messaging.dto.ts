import { IsOptional, IsBoolean, IsEnum } from 'class-validator';
import { Transform } from 'class-transformer';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { AnnouncementPriority } from '../entities/announcement.entity';

/**
 * Query parameters for fetching conversations.
 */
export class QueryConversationsDto extends PaginationDto { }

/**
 * Query parameters for fetching messages.
 */
export class QueryMessagesDto extends PaginationDto { }

/**
 * Query parameters for fetching announcements.
 */
export class QueryAnnouncementsDto extends PaginationDto {
    @IsEnum(AnnouncementPriority)
    @IsOptional()
    priority?: AnnouncementPriority;

    @IsBoolean()
    @IsOptional()
    @Transform(({ value }) => value === 'true' || value === true)
    isPinned?: boolean;

    @IsBoolean()
    @IsOptional()
    @Transform(({ value }) => value === 'true' || value === true)
    includeDrafts?: boolean;
}
