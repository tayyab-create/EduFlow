import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
    Index,
} from 'typeorm';
import { User } from '../../database/entities/user.entity';

/**
 * Types of notifications in the system.
 */
export enum NotificationType {
    ATTENDANCE = 'attendance',
    GRADE = 'grade',
    FEE = 'fee',
    MESSAGE = 'message',
    ANNOUNCEMENT = 'announcement',
    TIMETABLE = 'timetable',
    SYSTEM = 'system',
}

/**
 * Priority levels for notifications.
 */
export enum NotificationPriority {
    LOW = 'low',
    NORMAL = 'normal',
    HIGH = 'high',
    URGENT = 'urgent',
}

/**
 * Notification entity for in-app notifications.
 */
@Entity('notifications')
@Index(['userId', 'isRead'])
@Index(['userId', 'createdAt'])
export class Notification {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    /**
     * User who receives the notification.
     */
    @Column({ name: 'user_id', type: 'uuid' })
    @Index()
    userId: string;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: User;

    /**
     * Type of notification for categorization and filtering.
     */
    @Column({
        type: 'enum',
        enum: NotificationType,
        default: NotificationType.SYSTEM,
    })
    @Index()
    type: NotificationType;

    /**
     * Priority level for display order and styling.
     */
    @Column({
        type: 'enum',
        enum: NotificationPriority,
        default: NotificationPriority.NORMAL,
    })
    priority: NotificationPriority;

    /**
     * Short title for the notification.
     */
    @Column({ length: 200 })
    title: string;

    /**
     * Full notification message body.
     */
    @Column({ type: 'text' })
    body: string;

    /**
     * Additional data for navigation/actions (e.g., { studentId, classId }).
     */
    @Column({ type: 'jsonb', nullable: true })
    data: Record<string, unknown> | null;

    /**
     * Optional action URL or route.
     */
    @Column({ name: 'action_url', type: 'varchar', length: 500, nullable: true })
    actionUrl: string | null;

    /**
     * Whether the notification has been read.
     */
    @Column({ name: 'is_read', type: 'boolean', default: false })
    isRead: boolean;

    /**
     * When the notification was read.
     */
    @Column({ name: 'read_at', type: 'timestamptz', nullable: true })
    readAt: Date | null;

    @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
    updatedAt: Date;
}
