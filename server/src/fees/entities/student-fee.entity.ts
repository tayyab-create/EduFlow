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
import { Student } from '../../students/entities/student.entity';
import { FeeStructure } from './fee-structure.entity';
import { Term } from '../../terms/entities/term.entity';

/**
 * Student fee status enum.
 */
export enum StudentFeeStatus {
    PENDING = 'pending',
    PARTIAL = 'partial',
    PAID = 'paid',
    OVERDUE = 'overdue',
    WAIVED = 'waived',
    CANCELLED = 'cancelled',
}

/**
 * StudentFee entity - individual student fee invoices/dues.
 * Each record represents a specific fee charge for a student.
 */
@Entity('student_fees')
@Index(['studentId', 'feeStructureId', 'month', 'year'], { unique: true })
export class StudentFee {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'student_id', type: 'uuid' })
    @Index()
    studentId: string;

    @ManyToOne(() => Student, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'student_id' })
    student: Student;

    @Column({ name: 'fee_structure_id', type: 'uuid' })
    @Index()
    feeStructureId: string;

    @ManyToOne(() => FeeStructure, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'fee_structure_id' })
    feeStructure: FeeStructure;

    @Column({ name: 'term_id', type: 'uuid', nullable: true })
    termId: string;

    @ManyToOne(() => Term, { onDelete: 'SET NULL' })
    @JoinColumn({ name: 'term_id' })
    term: Term;

    // Billing period
    @Column({ type: 'int' })
    month: number; // 1-12

    @Column({ type: 'int' })
    year: number;

    // Amounts
    @Column({ name: 'base_amount', type: 'decimal', precision: 10, scale: 2 })
    baseAmount: number;

    @Column({ name: 'discount_amount', type: 'decimal', precision: 10, scale: 2, default: 0 })
    discountAmount: number;

    @Column({ name: 'discount_reason', length: 255, nullable: true })
    discountReason: string;

    @Column({ name: 'late_fee', type: 'decimal', precision: 10, scale: 2, default: 0 })
    lateFee: number;

    @Column({ name: 'net_amount', type: 'decimal', precision: 10, scale: 2 })
    netAmount: number; // baseAmount - discountAmount + lateFee

    @Column({ name: 'paid_amount', type: 'decimal', precision: 10, scale: 2, default: 0 })
    paidAmount: number;

    @Column({ name: 'balance_amount', type: 'decimal', precision: 10, scale: 2 })
    balanceAmount: number; // netAmount - paidAmount

    // Dates
    @Column({ name: 'due_date', type: 'date' })
    dueDate: Date;

    @Column({ name: 'paid_date', type: 'date', nullable: true })
    paidDate: Date;

    // Status
    @Column({
        type: 'enum',
        enum: StudentFeeStatus,
        default: StudentFeeStatus.PENDING,
    })
    status: StudentFeeStatus;

    @Column({ type: 'text', nullable: true })
    notes: string;

    @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
    updatedAt: Date;
}
