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
import { FeeType } from './fee-type.entity';
import { Class } from '../../classes/entities/class.entity';
import { AcademicYear } from '../../academic-years/entities/academic-year.entity';

/**
 * FeeStructure entity - defines fee amounts per class.
 * Links fee types to classes with specific amounts.
 */
@Entity('fee_structures')
@Index(['feeTypeId', 'classId', 'academicYearId'], { unique: true })
export class FeeStructure {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'fee_type_id', type: 'uuid' })
    @Index()
    feeTypeId: string;

    @ManyToOne(() => FeeType, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'fee_type_id' })
    feeType: FeeType;

    @Column({ name: 'class_id', type: 'uuid' })
    @Index()
    classId: string;

    @ManyToOne(() => Class, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'class_id' })
    class: Class;

    @Column({ name: 'academic_year_id', type: 'uuid' })
    @Index()
    academicYearId: string;

    @ManyToOne(() => AcademicYear, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'academic_year_id' })
    academicYear: AcademicYear;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    amount: number;

    @Column({ name: 'due_day', type: 'int', default: 10 })
    dueDay: number; // Day of month when fee is due

    @Column({ name: 'late_fee_percentage', type: 'decimal', precision: 5, scale: 2, default: 0 })
    lateFeePercentage: number;

    @Column({ name: 'late_fee_fixed', type: 'decimal', precision: 10, scale: 2, default: 0 })
    lateFeeFixed: number;

    @Column({ name: 'discount_available', type: 'boolean', default: true })
    discountAvailable: boolean;

    @Column({ name: 'is_active', type: 'boolean', default: true })
    isActive: boolean;

    @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
    updatedAt: Date;
}
