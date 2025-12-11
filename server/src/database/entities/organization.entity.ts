import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    DeleteDateColumn,
    OneToMany,
} from 'typeorm';
import { School } from './school.entity';
import { User } from './user.entity';

/**
 * Organization entity - represents a school chain/group.
 * Examples: Beaconhouse School System, City School, Lahore Grammar School
 */
@Entity('organizations')
export class Organization {
    @PrimaryGeneratedColumn('uuid')
    id: string;

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

    @Column({ name: 'headquarters_address', type: 'text', nullable: true })
    headquartersAddress: string;

    @Column({ length: 100, nullable: true })
    city: string;

    @Column({ length: 100, default: 'Pakistan' })
    country: string;

    @Column({ length: 20, nullable: true })
    phone: string;

    @Column({ length: 255, nullable: true })
    email: string;

    @Column({ length: 255, nullable: true })
    website: string;

    // Branding (defaults for all schools)
    @Column({ name: 'primary_color', length: 7, default: '#4F46E5' })
    primaryColor: string;

    @Column({ name: 'secondary_color', length: 7, default: '#10B981' })
    secondaryColor: string;

    // Subscription & Limits
    @Column({ name: 'subscription_tier', length: 20, default: 'enterprise' })
    subscriptionTier: string;

    @Column({ name: 'max_schools', type: 'int', default: 10 })
    maxSchools: number;

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
    @OneToMany(() => School, (school) => school.organization)
    schools: School[];

    @OneToMany(() => User, (user) => user.organization)
    users: User[];
}
