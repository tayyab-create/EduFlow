import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import {
    Notification,
    NotificationType,
    NotificationPriority,
} from './entities/notification.entity';
import {
    CreateNotificationDto,
    CreateBulkNotificationDto,
    QueryNotificationsDto,
} from './dto';
import {
    PaginatedResponse,
    createPaginatedResponse,
} from '../common/dto/pagination.dto';

/**
 * Interface for unread count by type.
 */
export interface UnreadCountByType {
    type: NotificationType;
    count: number;
}

/**
 * Service for managing in-app notifications.
 * Handles creation, queries, and read status management.
 */
@Injectable()
export class NotificationsService {
    constructor(
        @InjectRepository(Notification)
        private readonly notificationRepository: Repository<Notification>,
    ) { }

    /**
     * Create a single notification for a user.
     */
    async create(dto: CreateNotificationDto): Promise<Notification> {
        const notification = this.notificationRepository.create({
            userId: dto.userId,
            type: dto.type,
            priority: dto.priority ?? NotificationPriority.NORMAL,
            title: dto.title,
            body: dto.body,
            data: dto.data ?? null,
            actionUrl: dto.actionUrl ?? null,
        });

        return this.notificationRepository.save(notification);
    }

    /**
     * Create notifications for multiple users.
     * Useful for announcements or bulk alerts.
     */
    async createBulk(dto: CreateBulkNotificationDto): Promise<{ count: number }> {
        const notifications = dto.userIds.map((userId) =>
            this.notificationRepository.create({
                userId,
                type: dto.type,
                priority: dto.priority ?? NotificationPriority.NORMAL,
                title: dto.title,
                body: dto.body,
                data: dto.data ?? null,
                actionUrl: dto.actionUrl ?? null,
            }),
        );

        await this.notificationRepository.save(notifications);
        return { count: notifications.length };
    }

    /**
     * Get notifications for a user with pagination and filtering.
     */
    async getForUser(
        userId: string,
        query: QueryNotificationsDto,
    ): Promise<PaginatedResponse<Notification>> {
        const queryBuilder = this.notificationRepository
            .createQueryBuilder('notification')
            .where('notification.user_id = :userId', { userId });

        if (query.type) {
            queryBuilder.andWhere('notification.type = :type', {
                type: query.type,
            });
        }

        if (query.isRead !== undefined) {
            queryBuilder.andWhere('notification.is_read = :isRead', {
                isRead: query.isRead,
            });
        }

        queryBuilder.orderBy('notification.created_at', 'DESC');

        const total = await queryBuilder.getCount();
        queryBuilder.skip(query.skip).take(query.take);

        const notifications = await queryBuilder.getMany();
        return createPaginatedResponse(notifications, total, query);
    }

    /**
     * Get a single notification by ID.
     */
    async findOne(id: string, userId: string): Promise<Notification> {
        const notification = await this.notificationRepository.findOne({
            where: { id, userId },
        });

        if (!notification) {
            throw new NotFoundException(`Notification with ID ${id} not found`);
        }

        return notification;
    }

    /**
     * Mark a notification as read.
     */
    async markAsRead(id: string, userId: string): Promise<Notification> {
        const notification = await this.findOne(id, userId);

        if (!notification.isRead) {
            notification.isRead = true;
            notification.readAt = new Date();
            await this.notificationRepository.save(notification);
        }

        return notification;
    }

    /**
     * Mark multiple notifications as read.
     */
    async markMultipleAsRead(ids: string[], userId: string): Promise<{ count: number }> {
        const result = await this.notificationRepository.update(
            { id: In(ids), userId, isRead: false },
            { isRead: true, readAt: new Date() },
        );

        return { count: result.affected ?? 0 };
    }

    /**
     * Mark all notifications as read for a user.
     */
    async markAllAsRead(userId: string): Promise<{ count: number }> {
        const result = await this.notificationRepository.update(
            { userId, isRead: false },
            { isRead: true, readAt: new Date() },
        );

        return { count: result.affected ?? 0 };
    }

    /**
     * Get unread notification count for a user.
     */
    async getUnreadCount(userId: string): Promise<number> {
        return this.notificationRepository.count({
            where: { userId, isRead: false },
        });
    }

    /**
     * Get unread count grouped by notification type.
     */
    async getUnreadCountByType(userId: string): Promise<UnreadCountByType[]> {
        const result = await this.notificationRepository
            .createQueryBuilder('notification')
            .select('notification.type', 'type')
            .addSelect('COUNT(*)', 'count')
            .where('notification.user_id = :userId', { userId })
            .andWhere('notification.is_read = false')
            .groupBy('notification.type')
            .getRawMany<{ type: NotificationType; count: string }>();

        return result.map((row) => ({
            type: row.type,
            count: parseInt(row.count, 10),
        }));
    }

    /**
     * Delete a notification.
     */
    async remove(id: string, userId: string): Promise<void> {
        const notification = await this.findOne(id, userId);
        await this.notificationRepository.remove(notification);
    }

    /**
     * Delete all read notifications older than specified days.
     * Useful for cleanup.
     */
    async deleteOldReadNotifications(
        userId: string,
        olderThanDays: number,
    ): Promise<{ count: number }> {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

        const result = await this.notificationRepository
            .createQueryBuilder()
            .delete()
            .from(Notification)
            .where('user_id = :userId', { userId })
            .andWhere('is_read = true')
            .andWhere('created_at < :cutoffDate', { cutoffDate })
            .execute();

        return { count: result.affected ?? 0 };
    }

    // ==================== HELPER METHODS FOR SPECIFIC NOTIFICATIONS ====================

    /**
     * Create an attendance notification for a parent.
     */
    async notifyParentOfAbsence(
        parentUserId: string,
        studentName: string,
        className: string,
        date: string,
        studentId: string,
    ): Promise<Notification> {
        return this.create({
            userId: parentUserId,
            type: NotificationType.ATTENDANCE,
            priority: NotificationPriority.HIGH,
            title: 'Student Absent',
            body: `${studentName} was marked absent from ${className} on ${date}.`,
            data: { studentId, date },
            actionUrl: `/students/${studentId}/attendance`,
        });
    }

    /**
     * Create a grade notification for student/parent.
     */
    async notifyOfNewGrade(
        userId: string,
        studentName: string,
        subjectName: string,
        assessmentName: string,
        score: string,
        assessmentId: string,
    ): Promise<Notification> {
        return this.create({
            userId,
            type: NotificationType.GRADE,
            priority: NotificationPriority.NORMAL,
            title: 'New Grade Posted',
            body: `${studentName} received ${score} in ${subjectName} - ${assessmentName}.`,
            data: { assessmentId },
            actionUrl: `/grades/${assessmentId}`,
        });
    }

    /**
     * Create a fee due notification.
     */
    async notifyOfFeeDue(
        parentUserId: string,
        studentName: string,
        feeType: string,
        amount: number,
        dueDate: string,
        studentFeeId: string,
    ): Promise<Notification> {
        return this.create({
            userId: parentUserId,
            type: NotificationType.FEE,
            priority: NotificationPriority.HIGH,
            title: 'Fee Payment Due',
            body: `${feeType} fee of Rs. ${amount} for ${studentName} is due on ${dueDate}.`,
            data: { studentFeeId, amount, dueDate },
            actionUrl: `/fees/${studentFeeId}`,
        });
    }
}
