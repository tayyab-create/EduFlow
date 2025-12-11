import {
    Entity,
    Column,
    ManyToOne,
    OneToMany,
    JoinColumn,
    Index,
    PrimaryGeneratedColumn,
    CreateDateColumn,
} from 'typeorm';
import { School } from '../../database/entities/school.entity';
import { AcademicYear } from '../../academic-years/entities/academic-year.entity';

/**
 * Class entity following TDD Database_Schema.md.
 * Represents a grade level (Class 1, Class 5, Grade 10, etc.)
 */
@Entity('classes')
@Index(['schoolId', 'academicYearId', 'name'], { unique: true })
export class Class {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'school_id', type: 'uuid' })
    @Index()
    schoolId: string;

    @ManyToOne(() => School, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'school_id' })
    school: School;

    @Column({ name: 'academic_year_id', type: 'uuid' })
    @Index()
    academicYearId: string;

    @ManyToOne(() => AcademicYear, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'academic_year_id' })
    academicYear: AcademicYear;

    @Column({ length: 50 })
    name: string; // e.g., "Class 5", "Grade 10", "Nursery"

    @Column({ name: 'grade_level', type: 'int', nullable: true })
    gradeLevel: number; // Numeric level for sorting (1-12)

    @Column({ name: 'display_order', type: 'int', default: 0 })
    displayOrder: number;

    @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
    createdAt: Date;

    // Relation to sections - will be added
    // @OneToMany(() => Section, (section) => section.class)
    // sections: Section[];
}
