import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
    Index,
} from 'typeorm';
import { Conversation } from './conversation.entity';
import { User } from '../../database/entities/user.entity';

/**
 * Message entity for individual messages within a conversation.
 */
@Entity('messages')
@Index(['conversationId', 'createdAt'])
@Index(['senderId'])
export class Message {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    /**
     * Reference to the conversation.
     */
    @Column({ name: 'conversation_id', type: 'uuid' })
    conversationId: string;

    @ManyToOne(() => Conversation, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'conversation_id' })
    conversation: Conversation;

    /**
     * User who sent the message.
     */
    @Column({ name: 'sender_id', type: 'uuid' })
    senderId: string;

    @ManyToOne(() => User, { onDelete: 'SET NULL' })
    @JoinColumn({ name: 'sender_id' })
    sender: User;

    /**
     * Message content.
     */
    @Column({ type: 'text' })
    content: string;

    /**
     * Optional attachments (file URLs, metadata).
     */
    @Column({ type: 'jsonb', nullable: true })
    attachments: Array<{
        url: string;
        name: string;
        type: string;
        size: number;
    }> | null;

    /**
     * Array of user IDs who have read this message.
     */
    @Column({ name: 'read_by', type: 'jsonb', default: [] })
    readBy: string[];

    /**
     * Whether the message has been edited.
     */
    @Column({ name: 'is_edited', type: 'boolean', default: false })
    isEdited: boolean;

    /**
     * When the message was edited.
     */
    @Column({ name: 'edited_at', type: 'timestamptz', nullable: true })
    editedAt: Date | null;

    /**
     * Whether the message is deleted (soft delete for "message deleted" display).
     */
    @Column({ name: 'is_deleted', type: 'boolean', default: false })
    isDeleted: boolean;

    @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
    createdAt: Date;
}
