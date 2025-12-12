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
import { School } from '../../database/entities/school.entity';
import { User } from '../../database/entities/user.entity';

/**
 * Priority levels for announcements.
 */
export enum AnnouncementPriority {
    NORMAL = 'normal',
    IMPORTANT = 'important',
    URGENT = 'urgent',
}

/**
 * Announcement entity for school-wide or targeted announcements.
 */
@Entity('announcements')
@Index(['schoolId', 'publishedAt'])
@Index(['schoolId', 'isPinned'])
export class Announcement {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'school_id', type: 'uuid' })
    @Index()
    schoolId: string;

    @ManyToOne(() => School, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'school_id' })
    school: School;

    /**
     * Title of the announcement.
     */
    @Column({ length: 200 })
    title: string;

    /**
     * Full content of the announcement.
     */
    @Column({ type: 'text' })
    content: string;

    /**
     * Priority level.
     */
    @Column({
        type: 'enum',
        enum: AnnouncementPriority,
        default: AnnouncementPriority.NORMAL,
    })
    priority: AnnouncementPriority;

    /**
     * Target roles (empty = all roles).
     */
    @Column({ name: 'target_roles', type: 'jsonb', default: [] })
    targetRoles: string[];

    /**
     * Target class IDs (empty = all classes).
     */
    @Column({ name: 'target_class_ids', type: 'jsonb', default: [] })
    targetClassIds: string[];

    /**
     * Optional attachments.
     */
    @Column({ type: 'jsonb', nullable: true })
    attachments: Array<{
        url: string;
        name: string;
        type: string;
        size: number;
    }> | null;

    /**
     * When the announcement was published.
     */
    @Column({ name: 'published_at', type: 'timestamptz', nullable: true })
    publishedAt: Date | null;

    /**
     * When the announcement expires.
     */
    @Column({ name: 'expires_at', type: 'timestamptz', nullable: true })
    expiresAt: Date | null;

    /**
     * Whether the announcement is pinned to top.
     */
    @Column({ name: 'is_pinned', type: 'boolean', default: false })
    isPinned: boolean;

    /**
     * Whether the announcement is a draft.
     */
    @Column({ name: 'is_draft', type: 'boolean', default: false })
    isDraft: boolean;

    /**
     * User who created the announcement.
     */
    @Column({ name: 'created_by', type: 'uuid' })
    createdBy: string;

    @ManyToOne(() => User, { onDelete: 'SET NULL' })
    @JoinColumn({ name: 'created_by' })
    creator: User;

    @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
    updatedAt: Date;
}
