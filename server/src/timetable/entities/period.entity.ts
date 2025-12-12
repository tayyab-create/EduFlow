import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
    Index,
} from 'typeorm';
import { School } from '../../database/entities/school.entity';

/**
 * Days of the week for timetable scheduling.
 */
export enum DayOfWeek {
    MONDAY = 'monday',
    TUESDAY = 'tuesday',
    WEDNESDAY = 'wednesday',
    THURSDAY = 'thursday',
    FRIDAY = 'friday',
    SATURDAY = 'saturday',
    SUNDAY = 'sunday',
}

/**
 * Period entity defines the time slots for a school day.
 * Example: Period 1 (8:00 AM - 8:45 AM)
 */
@Entity('periods')
@Index(['schoolId', 'dayOfWeek', 'order'], { unique: true })
export class Period {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'school_id', type: 'uuid' })
    @Index()
    schoolId: string;

    @ManyToOne(() => School, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'school_id' })
    school: School;

    /**
     * Display name for the period (e.g., "Period 1", "Break", "Lunch")
     */
    @Column({ length: 50 })
    name: string;

    /**
     * Start time in HH:MM format (24-hour)
     */
    @Column({ name: 'start_time', type: 'time' })
    startTime: string;

    /**
     * End time in HH:MM format (24-hour)
     */
    @Column({ name: 'end_time', type: 'time' })
    endTime: string;

    /**
     * Day of the week this period applies to.
     */
    @Column({
        name: 'day_of_week',
        type: 'enum',
        enum: DayOfWeek,
    })
    dayOfWeek: DayOfWeek;

    /**
     * Display order within the day (1, 2, 3, etc.)
     */
    @Column({ type: 'int', default: 1 })
    order: number;

    /**
     * Whether this is a break period (not a teaching period).
     */
    @Column({ name: 'is_break', type: 'boolean', default: false })
    isBreak: boolean;

    /**
     * Duration in minutes (calculated from start/end time).
     */
    @Column({ name: 'duration_minutes', type: 'int', default: 45 })
    durationMinutes: number;

    @Column({ name: 'is_active', type: 'boolean', default: true })
    isActive: boolean;

    @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
    updatedAt: Date;
}
