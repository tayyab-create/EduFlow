import {
    Entity,
    Column,
    ManyToOne,
    JoinColumn,
    Index,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';
import { School } from '../../database/entities/school.entity';

/**
 * Fee frequency enum.
 */
export enum FeeFrequency {
    ONE_TIME = 'one_time',
    MONTHLY = 'monthly',
    QUARTERLY = 'quarterly',
    TERM_WISE = 'term_wise',
    YEARLY = 'yearly',
}

/**
 * FeeType entity - defines different types of fees.
 * e.g., Tuition, Admission, Transport, Lab Fee, etc.
 */
@Entity('fee_types')
@Index(['schoolId', 'name'], { unique: true })
export class FeeType {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'school_id', type: 'uuid' })
    @Index()
    schoolId: string;

    @ManyToOne(() => School, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'school_id' })
    school: School;

    @Column({ length: 100 })
    name: string; // e.g., "Tuition Fee", "Admission Fee"

    @Column({ name: 'name_urdu', length: 100, nullable: true })
    nameUrdu: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({
        type: 'enum',
        enum: FeeFrequency,
        default: FeeFrequency.MONTHLY,
    })
    frequency: FeeFrequency;

    @Column({ name: 'is_optional', type: 'boolean', default: false })
    isOptional: boolean;

    @Column({ name: 'is_refundable', type: 'boolean', default: false })
    isRefundable: boolean;

    @Column({ name: 'is_active', type: 'boolean', default: true })
    isActive: boolean;

    @Column({ name: 'display_order', type: 'int', default: 0 })
    displayOrder: number;

    @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
    updatedAt: Date;
}
