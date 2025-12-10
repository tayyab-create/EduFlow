import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    DeleteDateColumn,
    OneToMany,
    ManyToOne,
    JoinColumn,
    Index,
} from 'typeorm';
import { User } from './user.entity';
import { Organization } from './organization.entity';

@Entity('schools')
@Index(['organizationId'])
export class School {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    // Organization Reference (optional - for school chains)
    @Column({ name: 'organization_id', type: 'uuid', nullable: true })
    organizationId: string;

    @ManyToOne(() => Organization, (org) => org.schools, { onDelete: 'SET NULL' })
    @JoinColumn({ name: 'organization_id' })
    organization: Organization;

    // Basic Info
    @Column({ length: 255 })
    name: string;

    @Column({ name: 'name_urdu', length: 255, nullable: true })
    nameUrdu: string;

    @Column({ length: 50, unique: true })
    code: string;

    // Contact
    @Column({ name: 'logo_url', length: 500, nullable: true })
    logoUrl: string;

    @Column({ type: 'text', nullable: true })
    address: string;

    @Column({ length: 100, nullable: true })
    city: string;

    @Column({ length: 100, nullable: true })
    district: string;

    @Column({ length: 100, nullable: true })
    province: string;

    @Column({ name: 'postal_code', length: 20, nullable: true })
    postalCode: string;

    @Column({ length: 20, nullable: true })
    phone: string;

    @Column({ length: 255, nullable: true })
    email: string;

    @Column({ length: 255, nullable: true })
    website: string;

    // Branding
    @Column({ name: 'primary_color', length: 7, default: '#4F46E5' })
    primaryColor: string;

    @Column({ name: 'secondary_color', length: 7, default: '#10B981' })
    secondaryColor: string;

    // Subscription & Limits
    @Column({ name: 'subscription_tier', length: 20, default: 'free' })
    subscriptionTier: string;

    @Column({ name: 'subscription_start', type: 'date', nullable: true })
    subscriptionStart: Date;

    @Column({ name: 'subscription_end', type: 'date', nullable: true })
    subscriptionEnd: Date;

    @Column({ name: 'max_students', type: 'int', default: 100 })
    maxStudents: number;

    @Column({ name: 'max_staff', type: 'int', default: 20 })
    maxStaff: number;

    // Settings (JSONB)
    @Column({
        type: 'jsonb',
        default: {
            academic_year_start_month: 4,
            grading_scale: 'default',
            attendance_time_limit_minutes: 120,
            late_fee_enabled: true,
            sms_notifications_enabled: false,
            currency: 'PKR',
            timezone: 'Asia/Karachi',
        },
    })
    settings: Record<string, any>;

    // Status
    @Column({ name: 'is_active', type: 'boolean', default: true })
    isActive: boolean;

    // Timestamps
    @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
    updatedAt: Date;

    @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz', nullable: true })
    deletedAt: Date;

    // Relations
    @OneToMany(() => User, (user) => user.school)
    users: User[];
}
