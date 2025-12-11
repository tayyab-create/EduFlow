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
import { AcademicYear } from '../../academic-years/entities/academic-year.entity';

/**
 * Term entity following TDD Database_Schema.md.
 * Represents academic terms (First Term, Mid-Year, Final, etc.)
 */
@Entity('terms')
@Index(['academicYearId', 'termNumber'], { unique: true })
export class Term {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'academic_year_id', type: 'uuid' })
    @Index()
    academicYearId: string;

    @ManyToOne(() => AcademicYear, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'academic_year_id' })
    academicYear: AcademicYear;

    @Column({ name: 'school_id', type: 'uuid' })
    @Index()
    schoolId: string;

    @ManyToOne(() => School, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'school_id' })
    school: School;

    @Column({ length: 100 })
    name: string; // e.g., "First Term", "Mid-Year", "Final"

    @Column({ name: 'term_number', type: 'int' })
    termNumber: number; // 1, 2, 3

    @Column({ name: 'start_date', type: 'date' })
    startDate: Date;

    @Column({ name: 'end_date', type: 'date' })
    endDate: Date;

    // Report card configuration
    @Column({ name: 'result_publish_date', type: 'date', nullable: true })
    resultPublishDate: Date;

    @Column({ name: 'is_published', type: 'boolean', default: false })
    isPublished: boolean;

    @Column({ name: 'is_current', type: 'boolean', default: false })
    @Index()
    isCurrent: boolean;

    @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
    updatedAt: Date;
}
