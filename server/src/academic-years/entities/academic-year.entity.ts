import {
    Entity,
    Column,
    ManyToOne,
    OneToMany,
    JoinColumn,
    Index,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';
import { School } from '../../database/entities/school.entity';

/**
 * Academic Year entity following TDD Database_Schema.md.
 * Represents a school academic session (e.g., 2024-2025).
 */
@Entity('academic_years')
@Index(['schoolId', 'name'], { unique: true })
export class AcademicYear {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'school_id', type: 'uuid' })
    @Index()
    schoolId: string;

    @ManyToOne(() => School, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'school_id' })
    school: School;

    @Column({ length: 50 })
    name: string; // e.g., "2024-2025"

    @Column({ name: 'start_date', type: 'date' })
    startDate: Date;

    @Column({ name: 'end_date', type: 'date' })
    endDate: Date;

    @Column({ name: 'is_current', type: 'boolean', default: false })
    @Index()
    isCurrent: boolean;

    @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
    updatedAt: Date;

    // Relations will be added as we create other entities
    // @OneToMany(() => Term, (term) => term.academicYear)
    // terms: Term[];

    // @OneToMany(() => Class, (cls) => cls.academicYear)
    // classes: Class[];
}
