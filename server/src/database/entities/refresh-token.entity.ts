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

@Entity('refresh_tokens')
export class RefreshToken {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'user_id', type: 'uuid' })
    @Index()
    userId: string;

    @ManyToOne(() => User, (user) => user.refreshTokens, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: User;

    @Column({ name: 'token_hash', length: 255 })
    @Index()
    tokenHash: string;

    @Column({ name: 'device_info', length: 255, nullable: true })
    deviceInfo: string;

    @Column({ name: 'ip_address', type: 'inet', nullable: true })
    ipAddress: string;

    @Column({ name: 'user_agent', type: 'text', nullable: true })
    userAgent: string;

    @Column({ name: 'expires_at', type: 'timestamptz' })
    @Index()
    expiresAt: Date;

    @Column({ name: 'revoked_at', type: 'timestamptz', nullable: true })
    revokedAt: Date;

    @Column({ name: 'revoked_reason', length: 100, nullable: true })
    revokedReason: string;

    @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
    createdAt: Date;

    get isExpired(): boolean {
        return new Date() > this.expiresAt;
    }

    get isRevoked(): boolean {
        return this.revokedAt !== null;
    }

    get isValid(): boolean {
        return !this.isExpired && !this.isRevoked;
    }
}
