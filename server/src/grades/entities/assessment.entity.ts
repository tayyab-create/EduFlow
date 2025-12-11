import {
    Entity,
    Column,
    ManyToOne,
    JoinColumn,
    Index,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    DeleteDateColumn,
} from 'typeorm';
import { Section } from '../../classes/entities/section.entity';
import { Subject } from '../../subjects/entities/subject.entity';
import { Term } from '../../terms/entities/term.entity';
import { User } from '../../database/entities/user.entity';
import { AssessmentType } from './grading-scale.entity';

/**
 * Assessment entity following TDD Database_Schema.md.
 * Represents a test, quiz, assignment, or exam.
 */
@Entity('assessments')
@Index(['sectionId', 'subjectId', 'name'], { unique: true })
export class Assessment {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'section_id', type: 'uuid' })
    @Index()
    sectionId: string;

    @ManyToOne(() => Section, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'section_id' })
    section: Section;

    @Column({ name: 'subject_id', type: 'uuid' })
    @Index()
    subjectId: string;

    @ManyToOne(() => Subject, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'subject_id' })
    subject: Subject;

    @Column({ name: 'term_id', type: 'uuid', nullable: true })
    @Index()
    termId: string;

    @ManyToOne(() => Term, { onDelete: 'SET NULL' })
    @JoinColumn({ name: 'term_id' })
    term: Term;

    @Column({ length: 200 })
    name: string; // e.g., "Chapter 5 Quiz", "Mid-Term Exam"

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({
        type: 'enum',
        enum: AssessmentType,
        default: AssessmentType.QUIZ,
    })
    type: AssessmentType;

    @Column({ name: 'total_marks', type: 'decimal', precision: 6, scale: 2 })
    totalMarks: number;

    @Column({ name: 'weightage', type: 'decimal', precision: 5, scale: 2, default: 100 })
    weightage: number; // Percentage weight in final grade

    @Column({ name: 'assessment_date', type: 'date' })
    assessmentDate: Date;

    @Column({ name: 'due_date', type: 'date', nullable: true })
    dueDate: Date;

    // Grading
    @Column({ name: 'is_graded', type: 'boolean', default: false })
    isGraded: boolean;

    @Column({ name: 'is_published', type: 'boolean', default: false })
    isPublished: boolean;

    @Column({ name: 'published_at', type: 'timestamptz', nullable: true })
    publishedAt: Date;

    // Creator
    @Column({ name: 'created_by', type: 'uuid' })
    createdBy: string;

    @ManyToOne(() => User, { onDelete: 'SET NULL' })
    @JoinColumn({ name: 'created_by' })
    createdByUser: User;

    @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
    updatedAt: Date;

    @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz', nullable: true })
    deletedAt: Date;
}
