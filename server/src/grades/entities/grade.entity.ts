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
import { Assessment } from './assessment.entity';
import { User } from '../../database/entities/user.entity';

/**
 * Grade entity following TDD Database_Schema.md.
 * Records individual student grades for assessments.
 */
@Entity('grades')
@Index(['assessmentId', 'studentId'], { unique: true })
export class Grade {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'assessment_id', type: 'uuid' })
    @Index()
    assessmentId: string;

    @ManyToOne(() => Assessment, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'assessment_id' })
    assessment: Assessment;

    @Column({ name: 'student_id', type: 'uuid' })
    @Index()
    studentId: string;

    @ManyToOne(() => Student, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'student_id' })
    student: Student;

    // Marks
    @Column({ name: 'marks_obtained', type: 'decimal', precision: 6, scale: 2, nullable: true })
    marksObtained: number;

    @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
    percentage: number;

    @Column({ name: 'letter_grade', length: 5, nullable: true })
    letterGrade: string; // e.g., "A+", "B-"

    @Column({ name: 'gpa_points', type: 'decimal', precision: 3, scale: 2, nullable: true })
    gpaPoints: number;

    // Status
    @Column({ name: 'is_absent', type: 'boolean', default: false })
    isAbsent: boolean;

    @Column({ name: 'is_exempt', type: 'boolean', default: false })
    isExempt: boolean;

    @Column({ type: 'text', nullable: true })
    remarks: string;

    // Graded by
    @Column({ name: 'graded_by', type: 'uuid', nullable: true })
    gradedBy: string;

    @ManyToOne(() => User, { onDelete: 'SET NULL' })
    @JoinColumn({ name: 'graded_by' })
    gradedByUser: User;

    @Column({ name: 'graded_at', type: 'timestamptz', nullable: true })
    gradedAt: Date;

    @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
    updatedAt: Date;
}
