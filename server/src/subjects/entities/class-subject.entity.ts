import {
    Entity,
    Column,
    ManyToOne,
    JoinColumn,
    Index,
    PrimaryGeneratedColumn,
    CreateDateColumn,
} from 'typeorm';
import { Class } from '../../classes/entities/class.entity';
import { Subject } from './subject.entity';
import { User } from '../../database/entities/user.entity';

/**
 * ClassSubject entity following TDD Database_Schema.md.
 * Maps subjects to classes with assigned teacher.
 */
@Entity('class_subjects')
@Index(['classId', 'subjectId'], { unique: true })
export class ClassSubject {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'class_id', type: 'uuid' })
    @Index()
    classId: string;

    @ManyToOne(() => Class, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'class_id' })
    class: Class;

    @Column({ name: 'subject_id', type: 'uuid' })
    @Index()
    subjectId: string;

    @ManyToOne(() => Subject, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'subject_id' })
    subject: Subject;

    @Column({ name: 'teacher_id', type: 'uuid', nullable: true })
    teacherId: string;

    @ManyToOne(() => User, { onDelete: 'SET NULL' })
    @JoinColumn({ name: 'teacher_id' })
    teacher: User;

    @Column({ name: 'periods_per_week', type: 'int', default: 4 })
    periodsPerWeek: number;

    @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
    createdAt: Date;
}
