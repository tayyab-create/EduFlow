import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    DeleteDateColumn,
    ManyToOne,
    JoinColumn,
    OneToMany,
    Index,
} from 'typeorm';
import { School } from './school.entity';
import { Organization } from './organization.entity';
import { RefreshToken } from './refresh-token.entity';

export enum UserRole {
    SUPER_ADMIN = 'super_admin',
    ORG_ADMIN = 'org_admin',
    SCHOOL_ADMIN = 'school_admin',
    PRINCIPAL = 'principal',
    VICE_PRINCIPAL = 'vice_principal',
    TEACHER = 'teacher',
    ACCOUNTANT = 'accountant',
    HR = 'hr',
    LIBRARIAN = 'librarian',
    RECEPTIONIST = 'receptionist',
    PARENT = 'parent',
    STUDENT = 'student',
}

export enum UserStatus {
    ACTIVE = 'active',
    INACTIVE = 'inactive',
    PENDING = 'pending',
    SUSPENDED = 'suspended',
}

@Entity('users')
@Index(['schoolId', 'email'], { unique: true })
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    // Multi-tenancy: Organization & School
    @Column({ name: 'organization_id', type: 'uuid', nullable: true })
    @Index()
    organizationId: string;

    @ManyToOne(() => Organization, (organization) => organization.users, { onDelete: 'SET NULL' })
    @JoinColumn({ name: 'organization_id' })
    organization: Organization;

    @Column({ name: 'school_id', type: 'uuid', nullable: true })
    @Index()
    schoolId: string;

    @ManyToOne(() => School, (school) => school.users, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'school_id' })
    school: School;

    // Authentication
    @Column({ length: 255 })
    @Index()
    email: string;

    @Column({ name: 'password_hash', length: 255 })
    passwordHash: string;

    @Column({ length: 20, nullable: true })
    @Index()
    phone: string;

    // Profile
    @Column({ name: 'first_name', length: 100 })
    firstName: string;

    @Column({ name: 'last_name', length: 100 })
    lastName: string;

    @Column({ name: 'first_name_urdu', length: 100, nullable: true })
    firstNameUrdu: string;

    @Column({ name: 'last_name_urdu', length: 100, nullable: true })
    lastNameUrdu: string;

    @Column({ name: 'avatar_url', length: 500, nullable: true })
    avatarUrl: string;

    // Role & Status
    @Column({ type: 'enum', enum: UserRole })
    @Index()
    role: UserRole;

    @Column({ type: 'enum', enum: UserStatus, default: UserStatus.PENDING })
    @Index()
    status: UserStatus;

    // Security
    @Column({ name: 'email_verified', type: 'boolean', default: false })
    emailVerified: boolean;

    @Column({ name: 'email_verified_at', type: 'timestamptz', nullable: true })
    emailVerifiedAt: Date;

    @Column({ name: 'phone_verified', type: 'boolean', default: false })
    phoneVerified: boolean;

    @Column({ name: 'two_factor_enabled', type: 'boolean', default: false })
    twoFactorEnabled: boolean;

    @Column({ name: 'two_factor_secret', length: 255, nullable: true })
    twoFactorSecret: string;

    @Column({ name: 'failed_login_attempts', type: 'int', default: 0 })
    failedLoginAttempts: number;

    @Column({ name: 'locked_until', type: 'timestamptz', nullable: true })
    lockedUntil: Date;

    // Preferences
    @Column({
        name: 'notification_preferences',
        type: 'jsonb',
        default: {
            attendance: true,
            grades: true,
            fees: true,
            messages: true,
            announcements: true,
            email_enabled: true,
            sms_enabled: false,
            push_enabled: true,
        },
    })
    notificationPreferences: Record<string, any>;

    // Session tracking
    @Column({ name: 'last_login_at', type: 'timestamptz', nullable: true })
    lastLoginAt: Date;

    @Column({ name: 'last_login_ip', type: 'inet', nullable: true })
    lastLoginIp: string;

    @Column({ name: 'password_changed_at', type: 'timestamptz', nullable: true })
    passwordChangedAt: Date;

    // Timestamps
    @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
    updatedAt: Date;

    @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz', nullable: true })
    deletedAt: Date;

    // Relations
    @OneToMany(() => RefreshToken, (token) => token.user)
    refreshTokens: RefreshToken[];

    // Virtual properties
    get fullName(): string {
        return `${this.firstName} ${this.lastName}`;
    }
}
