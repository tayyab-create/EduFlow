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
import { Class } from './class.entity';
import { User } from '../../database/entities/user.entity';

/**
 * Section entity following TDD Database_Schema.md.
 * Represents a section within a class (A, B, Blue, etc.)
 */
@Entity('sections')
@Index(['classId', 'name'], { unique: true })
export class Section {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'class_id', type: 'uuid' })
    @Index()
    classId: string;

    @ManyToOne(() => Class, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'class_id' })
    class: Class;

    @Column({ length: 10 })
    name: string; // e.g., "A", "B", "Blue"

    @Column({ name: 'room_number', length: 20, nullable: true })
    roomNumber: string;

    @Column({ type: 'int', default: 40 })
    capacity: number;

    @Column({ name: 'class_teacher_id', type: 'uuid', nullable: true })
    classTeacherId: string;

    @ManyToOne(() => User, { onDelete: 'SET NULL' })
    @JoinColumn({ name: 'class_teacher_id' })
    classTeacher: User;

    @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
    updatedAt: Date;
}
