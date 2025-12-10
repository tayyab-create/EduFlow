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
import { School } from '../../database/entities/school.entity';

/**
 * Student status enum - matches TDD Database Schema.
 */
export enum StudentStatus {
    ACTIVE = 'active',
    GRADUATED = 'graduated',
    TRANSFERRED = 'transferred',
    WITHDRAWN = 'withdrawn',
    SUSPENDED = 'suspended',
    ALUMNI = 'alumni',
}

/**
 * Student entity following TDD Database_Schema.md (lines 528-631).
 * Contains all student information including personal, family, medical, and academic data.
 */
@Entity('students')
@Index(['schoolId', 'registrationNo'], { unique: true })
export class Student {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'school_id', type: 'uuid' })
    schoolId: string;

    @ManyToOne(() => School, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'school_id' })
    school: School;

    @Column({ name: 'section_id', type: 'uuid', nullable: true })
    sectionId: string;

    // Registration
    @Column({ name: 'registration_no', length: 50, nullable: true })
    registrationNo: string;

    @Column({ name: 'roll_number', length: 20, nullable: true })
    rollNumber: string;

    @Column({ name: 'admission_date', type: 'date' })
    admissionDate: Date;

    // Personal Info
    @Column({ name: 'first_name', length: 100 })
    @Index()
    firstName: string;

    @Column({ name: 'last_name', length: 100 })
    @Index()
    lastName: string;

    @Column({ name: 'first_name_urdu', length: 100, nullable: true })
    firstNameUrdu: string;

    @Column({ name: 'last_name_urdu', length: 100, nullable: true })
    lastNameUrdu: string;

    @Column({ name: 'date_of_birth', type: 'date' })
    dateOfBirth: Date;

    @Column({ length: 10, nullable: true })
    gender: string;

    @Column({ name: 'blood_group', length: 5, nullable: true })
    bloodGroup: string;

    @Column({ length: 50, nullable: true })
    religion: string;

    @Column({ length: 50, default: 'Pakistani' })
    nationality: string;

    @Column({ name: 'cnic_bform', length: 15, nullable: true })
    cnicBform: string;

    // Father Info
    @Column({ name: 'father_name', length: 200, nullable: true })
    fatherName: string;

    @Column({ name: 'father_name_urdu', length: 200, nullable: true })
    fatherNameUrdu: string;

    @Column({ name: 'father_cnic', length: 15, nullable: true })
    fatherCnic: string;

    @Column({ name: 'father_phone', length: 20, nullable: true })
    @Index()
    fatherPhone: string;

    @Column({ name: 'father_occupation', length: 100, nullable: true })
    fatherOccupation: string;

    @Column({ name: 'father_email', length: 255, nullable: true })
    fatherEmail: string;

    // Mother Info
    @Column({ name: 'mother_name', length: 200, nullable: true })
    motherName: string;

    @Column({ name: 'mother_phone', length: 20, nullable: true })
    motherPhone: string;

    @Column({ name: 'mother_occupation', length: 100, nullable: true })
    motherOccupation: string;

    // Guardian Info
    @Column({ name: 'guardian_name', length: 200, nullable: true })
    guardianName: string;

    @Column({ name: 'guardian_phone', length: 20, nullable: true })
    guardianPhone: string;

    @Column({ name: 'guardian_relation', length: 50, nullable: true })
    guardianRelation: string;

    // Contact
    @Column({ type: 'text', nullable: true })
    address: string;

    @Column({ length: 100, nullable: true })
    city: string;

    @Column({ name: 'postal_code', length: 20, nullable: true })
    postalCode: string;

    // Emergency Contact
    @Column({ name: 'emergency_contact_name', length: 200, nullable: true })
    emergencyContactName: string;

    @Column({ name: 'emergency_contact_phone', length: 20, nullable: true })
    emergencyContactPhone: string;

    @Column({ name: 'emergency_contact_relation', length: 50, nullable: true })
    emergencyContactRelation: string;

    // Medical
    @Column({ name: 'medical_conditions', type: 'text', nullable: true })
    medicalConditions: string;

    @Column({ type: 'text', nullable: true })
    allergies: string;

    @Column({ name: 'special_needs', type: 'text', nullable: true })
    specialNeeds: string;

    // Photo
    @Column({ name: 'photo_url', length: 500, nullable: true })
    photoUrl: string;

    // Previous Education
    @Column({ name: 'previous_school', length: 255, nullable: true })
    previousSchool: string;

    @Column({ name: 'previous_class', length: 50, nullable: true })
    previousClass: string;

    @Column({ name: 'transfer_certificate_no', length: 100, nullable: true })
    transferCertificateNo: string;

    // Transport
    @Column({ name: 'uses_transport', type: 'boolean', default: false })
    usesTransport: boolean;

    @Column({ name: 'transport_route_id', type: 'uuid', nullable: true })
    transportRouteId: string;

    // Sibling Tracking
    @Column({ name: 'sibling_group_id', type: 'uuid', nullable: true })
    @Index()
    siblingGroupId: string;

    // Promotion Tracking
    @Column({ name: 'previous_section_id', type: 'uuid', nullable: true })
    previousSectionId: string;

    // Status
    @Column({
        type: 'enum',
        enum: StudentStatus,
        default: StudentStatus.ACTIVE,
    })
    @Index()
    status: StudentStatus;

    // Timestamps
    @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
    updatedAt: Date;

    @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz', nullable: true })
    deletedAt: Date;

    // Virtual properties
    get fullName(): string {
        return `${this.firstName} ${this.lastName}`;
    }

    get fullNameUrdu(): string | null {
        if (this.firstNameUrdu && this.lastNameUrdu) {
            return `${this.firstNameUrdu} ${this.lastNameUrdu}`;
        }
        return null;
    }
}
