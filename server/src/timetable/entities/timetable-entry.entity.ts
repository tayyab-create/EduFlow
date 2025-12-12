import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
    Index,
    Unique,
} from 'typeorm';
import { Period } from './period.entity';
import { Section } from '../../classes/entities/section.entity';
import { Subject } from '../../subjects/entities/subject.entity';
import { User } from '../../database/entities/user.entity';
import { AcademicYear } from '../../academic-years/entities/academic-year.entity';

/**
 * TimetableEntry maps a subject and teacher to a specific period and section.
 * Represents one cell in the timetable grid.
 */
@Entity('timetable_entries')
@Unique(['periodId', 'sectionId']) // One entry per period per section
@Index(['sectionId', 'periodId'])
@Index(['teacherId', 'periodId'])
export class TimetableEntry {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    /**
     * Reference to the period (time slot).
     */
    @Column({ name: 'period_id', type: 'uuid' })
    periodId: string;

    @ManyToOne(() => Period, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'period_id' })
    period: Period;

    /**
     * Reference to the section (class).
     */
    @Column({ name: 'section_id', type: 'uuid' })
    sectionId: string;

    @ManyToOne(() => Section, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'section_id' })
    section: Section;

    /**
     * Reference to the subject being taught.
     */
    @Column({ name: 'subject_id', type: 'uuid' })
    subjectId: string;

    @ManyToOne(() => Subject, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'subject_id' })
    subject: Subject;

    /**
     * Reference to the teacher assigned.
     */
    @Column({ name: 'teacher_id', type: 'uuid' })
    teacherId: string;

    @ManyToOne(() => User, { onDelete: 'SET NULL' })
    @JoinColumn({ name: 'teacher_id' })
    teacher: User;

    /**
     * Reference to the academic year.
     */
    @Column({ name: 'academic_year_id', type: 'uuid' })
    academicYearId: string;

    @ManyToOne(() => AcademicYear, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'academic_year_id' })
    academicYear: AcademicYear;

    /**
     * Optional room number/name.
     */
    @Column({ type: 'varchar', length: 50, nullable: true })
    room: string | null;

    /**
     * Optional notes for this entry.
     */
    @Column({ type: 'text', nullable: true })
    notes: string | null;

    @Column({ name: 'is_active', type: 'boolean', default: true })
    isActive: boolean;

    @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
    updatedAt: Date;
}
