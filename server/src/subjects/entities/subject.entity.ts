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
 * Subject entity following TDD Database_Schema.md.
 * Represents a school subject (Mathematics, English, Science, etc.)
 */
@Entity('subjects')
@Index(['schoolId', 'code'], { unique: true })
export class Subject {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'school_id', type: 'uuid' })
    @Index()
    schoolId: string;

    @ManyToOne(() => School, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'school_id' })
    school: School;

    @Column({ length: 100 })
    name: string; // e.g., "Mathematics"

    @Column({ name: 'name_urdu', length: 100, nullable: true })
    nameUrdu: string; // e.g., "ریاضی"

    @Column({ length: 20, nullable: true })
    code: string; // e.g., "MATH"

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({ name: 'is_mandatory', type: 'boolean', default: true })
    isMandatory: boolean;

    @Column({ name: 'is_active', type: 'boolean', default: true })
    isActive: boolean;

    @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
    updatedAt: Date;
}
