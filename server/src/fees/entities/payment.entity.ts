import {
    Entity,
    Column,
    ManyToOne,
    JoinColumn,
    Index,
    PrimaryGeneratedColumn,
    CreateDateColumn,
} from 'typeorm';
import { Student } from '../../students/entities/student.entity';
import { StudentFee } from './student-fee.entity';
import { User } from '../../database/entities/user.entity';

/**
 * Payment method enum.
 */
export enum PaymentMethod {
    CASH = 'cash',
    BANK_TRANSFER = 'bank_transfer',
    CHEQUE = 'cheque',
    ONLINE = 'online',
    EASYPAISA = 'easypaisa',
    JAZZCASH = 'jazzcash',
    CARD = 'card',
}

/**
 * Payment status enum.
 */
export enum PaymentStatus {
    PENDING = 'pending',
    COMPLETED = 'completed',
    FAILED = 'failed',
    REFUNDED = 'refunded',
    CANCELLED = 'cancelled',
}

/**
 * Payment entity - records individual payment transactions.
 */
@Entity('payments')
@Index(['studentId', 'paymentDate'])
export class Payment {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'receipt_number', length: 50, unique: true })
    receiptNumber: string;

    @Column({ name: 'student_id', type: 'uuid' })
    @Index()
    studentId: string;

    @ManyToOne(() => Student, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'student_id' })
    student: Student;

    @Column({ name: 'student_fee_id', type: 'uuid', nullable: true })
    studentFeeId: string;

    @ManyToOne(() => StudentFee, { onDelete: 'SET NULL' })
    @JoinColumn({ name: 'student_fee_id' })
    studentFee: StudentFee;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    amount: number;

    @Column({
        name: 'payment_method',
        type: 'enum',
        enum: PaymentMethod,
        default: PaymentMethod.CASH,
    })
    paymentMethod: PaymentMethod;

    @Column({
        type: 'enum',
        enum: PaymentStatus,
        default: PaymentStatus.COMPLETED,
    })
    status: PaymentStatus;

    @Column({ name: 'payment_date', type: 'date' })
    paymentDate: Date;

    // Bank/transaction details
    @Column({ name: 'reference_number', length: 100, nullable: true })
    referenceNumber: string;

    @Column({ name: 'cheque_number', length: 50, nullable: true })
    chequeNumber: string;

    @Column({ name: 'bank_name', length: 100, nullable: true })
    bankName: string;

    @Column({ type: 'text', nullable: true })
    notes: string;

    // Received by
    @Column({ name: 'received_by', type: 'uuid' })
    receivedBy: string;

    @ManyToOne(() => User, { onDelete: 'SET NULL' })
    @JoinColumn({ name: 'received_by' })
    receivedByUser: User;

    @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
    createdAt: Date;
}
