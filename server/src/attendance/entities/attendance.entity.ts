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
import { Section } from '../../classes/entities/section.entity';
import { User } from '../../database/entities/user.entity';

/**
 * Attendance status enum - matches TDD Database Schema.
 */
export enum AttendanceStatus {
    PRESENT = 'present',
    ABSENT = 'absent',
    LATE = 'late',
    EARLY_DISMISSAL = 'early_dismissal',
    HALF_DAY = 'half_day',
    SICK_LEAVE = 'sick_leave',
    APPROVED_LEAVE = 'approved_leave',
    HOLIDAY = 'holiday',
}

/**
 * Attendance entity following TDD Database_Schema.md.
 * Records daily attendance for students with offline sync support.
 */
@Entity('attendance')
@Index(['studentId', 'date'], { unique: true })
export class Attendance {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'student_id', type: 'uuid' })
    @Index()
    studentId: string;

    @ManyToOne(() => Student, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'student_id' })
    student: Student;

    @Column({ name: 'section_id', type: 'uuid' })
    @Index()
    sectionId: string;

    @ManyToOne(() => Section, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'section_id' })
    section: Section;

    @Column({ type: 'date' })
    @Index()
    date: Date;

    @Column({
        type: 'enum',
        enum: AttendanceStatus,
        default: AttendanceStatus.PRESENT,
    })
    status: AttendanceStatus;

    // Timing details
    @Column({ name: 'check_in_time', type: 'time', nullable: true })
    checkInTime: string;

    @Column({ name: 'check_out_time', type: 'time', nullable: true })
    checkOutTime: string;

    @Column({ name: 'late_minutes', type: 'int', default: 0 })
    lateMinutes: number;

    @Column({ type: 'text', nullable: true })
    notes: string;

    // Who marked the attendance
    @Column({ name: 'marked_by', type: 'uuid' })
    markedBy: string;

    @ManyToOne(() => User, { onDelete: 'SET NULL' })
    @JoinColumn({ name: 'marked_by' })
    markedByUser: User;

    @Column({ name: 'marked_at', type: 'timestamptz', default: () => 'NOW()' })
    markedAt: Date;

    // Correction tracking
    @Column({ name: 'is_corrected', type: 'boolean', default: false })
    isCorrected: boolean;

    @Column({ name: 'corrected_by', type: 'uuid', nullable: true })
    correctedBy: string;

    @ManyToOne(() => User, { onDelete: 'SET NULL' })
    @JoinColumn({ name: 'corrected_by' })
    correctedByUser: User;

    @Column({ name: 'corrected_at', type: 'timestamptz', nullable: true })
    correctedAt: Date;

    @Column({ name: 'correction_reason', type: 'text', nullable: true })
    correctionReason: string;

    @Column({
        name: 'original_status',
        type: 'enum',
        enum: AttendanceStatus,
        nullable: true,
    })
    originalStatus: AttendanceStatus;

    // Offline sync support
    @Column({ name: 'client_id', length: 100, nullable: true })
    clientId: string;

    @Column({ name: 'synced_at', type: 'timestamptz', nullable: true })
    syncedAt: Date;

    // Timestamps
    @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
    updatedAt: Date;
}
