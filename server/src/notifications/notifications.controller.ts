import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    Query,
    UseGuards,
    ParseUUIDPipe,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { NotificationsService, UnreadCountByType } from './notifications.service';
import {
    CreateNotificationDto,
    CreateBulkNotificationDto,
    QueryNotificationsDto,
} from './dto';
import { Notification } from './entities';
import { Roles, CurrentUser } from '../common/decorators';
import { RolesGuard } from '../common/guards';
import { UserRole, User } from '../database/entities/user.entity';
import { PaginatedResponse } from '../common/dto/pagination.dto';

/**
 * Controller for notification management.
 */
@Controller('api/v1/notifications')
@UseGuards(RolesGuard)
export class NotificationsController {
    constructor(private readonly notificationsService: NotificationsService) { }

    /**
     * Create a notification (admin only).
     */
    @Post()
    @Roles(UserRole.SUPER_ADMIN, UserRole.SCHOOL_ADMIN)
    async create(
        @Body() dto: CreateNotificationDto,
    ): Promise<{ success: boolean; data: Notification }> {
        const notification = await this.notificationsService.create(dto);
        return { success: true, data: notification };
    }

    /**
     * Create bulk notifications (admin only).
     */
    @Post('bulk')
    @Roles(UserRole.SUPER_ADMIN, UserRole.SCHOOL_ADMIN)
    async createBulk(
        @Body() dto: CreateBulkNotificationDto,
    ): Promise<{ success: boolean; data: { count: number } }> {
        const result = await this.notificationsService.createBulk(dto);
        return { success: true, data: result };
    }

    /**
     * Get current user's notifications.
     */
    @Get()
    async getMyNotifications(
        @Query() query: QueryNotificationsDto,
        @CurrentUser() user: User,
    ): Promise<{ success: boolean; data: PaginatedResponse<Notification> }> {
        const result = await this.notificationsService.getForUser(user.id, query);
        return { success: true, data: result };
    }

    /**
     * Get unread count for current user.
     */
    @Get('unread-count')
    async getUnreadCount(
        @CurrentUser() user: User,
    ): Promise<{ success: boolean; data: { count: number } }> {
        const count = await this.notificationsService.getUnreadCount(user.id);
        return { success: true, data: { count } };
    }

    /**
     * Get unread count by type for current user.
     */
    @Get('unread-count/by-type')
    async getUnreadCountByType(
        @CurrentUser() user: User,
    ): Promise<{ success: boolean; data: UnreadCountByType[] }> {
        const counts = await this.notificationsService.getUnreadCountByType(user.id);
        return { success: true, data: counts };
    }

    /**
     * Get a single notification.
     */
    @Get(':id')
    async findOne(
        @Param('id', ParseUUIDPipe) id: string,
        @CurrentUser() user: User,
    ): Promise<{ success: boolean; data: Notification }> {
        const notification = await this.notificationsService.findOne(id, user.id);
        return { success: true, data: notification };
    }

    /**
     * Mark a notification as read.
     */
    @Patch(':id/read')
    async markAsRead(
        @Param('id', ParseUUIDPipe) id: string,
        @CurrentUser() user: User,
    ): Promise<{ success: boolean; data: Notification }> {
        const notification = await this.notificationsService.markAsRead(id, user.id);
        return { success: true, data: notification };
    }

    /**
     * Mark all notifications as read.
     */
    @Patch('read-all')
    async markAllAsRead(
        @CurrentUser() user: User,
    ): Promise<{ success: boolean; data: { count: number } }> {
        const result = await this.notificationsService.markAllAsRead(user.id);
        return { success: true, data: result };
    }

    /**
     * Delete a notification.
     */
    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async remove(
        @Param('id', ParseUUIDPipe) id: string,
        @CurrentUser() user: User,
    ): Promise<void> {
        await this.notificationsService.remove(id, user.id);
    }
}
