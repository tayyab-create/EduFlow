import { IsEnum, IsOptional, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { NotificationType } from '../entities/notification.entity';

/**
 * Query parameters for fetching notifications.
 */
export class QueryNotificationsDto extends PaginationDto {
    @IsEnum(NotificationType)
    @IsOptional()
    type?: NotificationType;

    @IsBoolean()
    @IsOptional()
    @Transform(({ value }) => value === 'true' || value === true)
    isRead?: boolean;
}
