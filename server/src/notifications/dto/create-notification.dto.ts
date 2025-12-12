import {
    IsString,
    IsNotEmpty,
    IsEnum,
    IsOptional,
    IsUUID,
    IsObject,
    MaxLength,
} from 'class-validator';
import { NotificationType, NotificationPriority } from '../entities/notification.entity';

/**
 * DTO for creating a notification.
 */
export class CreateNotificationDto {
    @IsUUID()
    @IsNotEmpty()
    userId: string;

    @IsEnum(NotificationType)
    type: NotificationType;

    @IsEnum(NotificationPriority)
    @IsOptional()
    priority?: NotificationPriority;

    @IsString()
    @IsNotEmpty()
    @MaxLength(200)
    title: string;

    @IsString()
    @IsNotEmpty()
    body: string;

    @IsObject()
    @IsOptional()
    data?: Record<string, unknown>;

    @IsString()
    @MaxLength(500)
    @IsOptional()
    actionUrl?: string;
}

/**
 * DTO for creating bulk notifications.
 */
export class CreateBulkNotificationDto {
    @IsUUID('4', { each: true })
    @IsNotEmpty()
    userIds: string[];

    @IsEnum(NotificationType)
    type: NotificationType;

    @IsEnum(NotificationPriority)
    @IsOptional()
    priority?: NotificationPriority;

    @IsString()
    @IsNotEmpty()
    @MaxLength(200)
    title: string;

    @IsString()
    @IsNotEmpty()
    body: string;

    @IsObject()
    @IsOptional()
    data?: Record<string, unknown>;

    @IsString()
    @MaxLength(500)
    @IsOptional()
    actionUrl?: string;
}
