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
 * Assessment type enum - different kinds of assessments.
 */
export enum AssessmentType {
    QUIZ = 'quiz',
    ASSIGNMENT = 'assignment',
    CLASSWORK = 'classwork',
    HOMEWORK = 'homework',
    PROJECT = 'project',
    MIDTERM = 'midterm',
    FINAL = 'final',
    PRACTICAL = 'practical',
    ORAL = 'oral',
    OTHER = 'other',
}

/**
 * GradingScale entity following TDD Database_Schema.md.
 * Defines how grades are calculated (percentage, letter, GPA).
 */
@Entity('grading_scales')
@Index(['schoolId', 'name'], { unique: true })
export class GradingScale {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'school_id', type: 'uuid' })
    @Index()
    schoolId: string;

    @ManyToOne(() => School, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'school_id' })
    school: School;

    @Column({ length: 100 })
    name: string; // e.g., "Default", "IGCSE", "Matric"

    @Column({ type: 'jsonb', default: '[]' })
    grades: GradeDefinition[]; // Array of grade definitions

    @Column({ name: 'passing_percentage', type: 'decimal', precision: 5, scale: 2, default: 33 })
    passingPercentage: number;

    @Column({ name: 'is_default', type: 'boolean', default: false })
    isDefault: boolean;

    @Column({ name: 'is_active', type: 'boolean', default: true })
    isActive: boolean;

    @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
    updatedAt: Date;
}

/**
 * Grade definition within a grading scale.
 */
export interface GradeDefinition {
    grade: string;      // e.g., "A+", "A", "B", "F"
    minPercentage: number;
    maxPercentage: number;
    gpaPoints?: number;  // e.g., 4.0, 3.7, etc.
    description?: string; // e.g., "Excellent", "Good"
}
