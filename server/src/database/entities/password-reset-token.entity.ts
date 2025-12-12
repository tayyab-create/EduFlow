import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
    Index,
} from 'typeorm';
import { User } from './user.entity';

/**
 * PasswordResetToken entity for password reset functionality.
 * Tokens expire after a set time and can only be used once.
 */
@Entity('password_reset_tokens')
@Index(['token'])
@Index(['userId'])
@Index(['expiresAt'])
export class PasswordResetToken {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    /**
     * User requesting the password reset.
     */
    @Column({ name: 'user_id', type: 'uuid' })
    userId: string;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: User;

    /**
     * Hashed reset token (the raw token is sent to user's email).
     */
    @Column({ type: 'varchar', length: 255 })
    token: string;

    /**
     * When the token expires.
     */
    @Column({ name: 'expires_at', type: 'timestamptz' })
    expiresAt: Date;

    /**
     * Whether the token has been used.
     */
    @Column({ name: 'is_used', type: 'boolean', default: false })
    isUsed: boolean;

    /**
     * When the token was used.
     */
    @Column({ name: 'used_at', type: 'timestamptz', nullable: true })
    usedAt: Date | null;

    @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
    createdAt: Date;
}
