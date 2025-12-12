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
 * Types of conversations.
 */
export enum ConversationType {
    DIRECT = 'direct', // One-to-one
    GROUP = 'group', // Multiple participants
}

/**
 * Conversation entity for grouping messages.
 */
@Entity('conversations')
@Index(['schoolId', 'createdAt'])
export class Conversation {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'school_id', type: 'uuid' })
    @Index()
    schoolId: string;

    @ManyToOne(() => School, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'school_id' })
    school: School;

    /**
     * Type of conversation.
     */
    @Column({
        type: 'enum',
        enum: ConversationType,
        default: ConversationType.DIRECT,
    })
    type: ConversationType;

    /**
     * Optional subject/title for the conversation.
     */
    @Column({ type: 'varchar', length: 200, nullable: true })
    subject: string | null;

    /**
     * Array of participant user IDs.
     */
    @Column({ name: 'participant_ids', type: 'jsonb' })
    participantIds: string[];

    /**
     * Timestamp of the last message in this conversation.
     */
    @Column({ name: 'last_message_at', type: 'timestamptz', nullable: true })
    lastMessageAt: Date | null;

    /**
     * Preview of the last message.
     */
    @Column({ name: 'last_message_preview', type: 'varchar', length: 200, nullable: true })
    lastMessagePreview: string | null;

    /**
     * User who created the conversation.
     */
    @Column({ name: 'created_by', type: 'uuid' })
    createdBy: string;

    @ManyToOne(() => User, { onDelete: 'SET NULL' })
    @JoinColumn({ name: 'created_by' })
    creator: User;

    @Column({ name: 'is_active', type: 'boolean', default: true })
    isActive: boolean;

    @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
    updatedAt: Date;
}
