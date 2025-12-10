import {
    IsString,
    IsOptional,
    IsDate,
    IsBoolean,
    IsUUID,
    IsEnum,
    MaxLength,
    IsEmail,
} from 'class-validator';
import { Type } from 'class-transformer';
import { StudentStatus } from '../entities/student.entity';

/**
 * DTO for creating a new student.
 * Required fields: firstName, lastName, dateOfBirth, admissionDate
 */
export class CreateStudentDto {
    // Registration
    @IsOptional()
    @IsString()
    @MaxLength(50)
    registrationNo?: string;

    @IsOptional()
    @IsString()
    @MaxLength(20)
    rollNumber?: string;

    @Type(() => Date)
    @IsDate()
    admissionDate: Date;

    // Personal Info (Required)
    @IsString()
    @MaxLength(100)
    firstName: string;

    @IsString()
    @MaxLength(100)
    lastName: string;

    @IsOptional()
    @IsString()
    @MaxLength(100)
    firstNameUrdu?: string;

    @IsOptional()
    @IsString()
    @MaxLength(100)
    lastNameUrdu?: string;

    @Type(() => Date)
    @IsDate()
    dateOfBirth: Date;

    @IsOptional()
    @IsString()
    @MaxLength(10)
    gender?: string;

    @IsOptional()
    @IsString()
    @MaxLength(5)
    bloodGroup?: string;

    @IsOptional()
    @IsString()
    @MaxLength(50)
    religion?: string;

    @IsOptional()
    @IsString()
    @MaxLength(50)
    nationality?: string;

    @IsOptional()
    @IsString()
    @MaxLength(15)
    cnicBform?: string;

    // Father Info
    @IsOptional()
    @IsString()
    @MaxLength(200)
    fatherName?: string;

    @IsOptional()
    @IsString()
    @MaxLength(200)
    fatherNameUrdu?: string;

    @IsOptional()
    @IsString()
    @MaxLength(15)
    fatherCnic?: string;

    @IsOptional()
    @IsString()
    @MaxLength(20)
    fatherPhone?: string;

    @IsOptional()
    @IsString()
    @MaxLength(100)
    fatherOccupation?: string;

    @IsOptional()
    @IsEmail()
    @MaxLength(255)
    fatherEmail?: string;

    // Mother Info
    @IsOptional()
    @IsString()
    @MaxLength(200)
    motherName?: string;

    @IsOptional()
    @IsString()
    @MaxLength(20)
    motherPhone?: string;

    @IsOptional()
    @IsString()
    @MaxLength(100)
    motherOccupation?: string;

    // Guardian Info
    @IsOptional()
    @IsString()
    @MaxLength(200)
    guardianName?: string;

    @IsOptional()
    @IsString()
    @MaxLength(20)
    guardianPhone?: string;

    @IsOptional()
    @IsString()
    @MaxLength(50)
    guardianRelation?: string;

    // Contact
    @IsOptional()
    @IsString()
    address?: string;

    @IsOptional()
    @IsString()
    @MaxLength(100)
    city?: string;

    @IsOptional()
    @IsString()
    @MaxLength(20)
    postalCode?: string;

    // Emergency Contact
    @IsOptional()
    @IsString()
    @MaxLength(200)
    emergencyContactName?: string;

    @IsOptional()
    @IsString()
    @MaxLength(20)
    emergencyContactPhone?: string;

    @IsOptional()
    @IsString()
    @MaxLength(50)
    emergencyContactRelation?: string;

    // Medical
    @IsOptional()
    @IsString()
    medicalConditions?: string;

    @IsOptional()
    @IsString()
    allergies?: string;

    @IsOptional()
    @IsString()
    specialNeeds?: string;

    // Photo
    @IsOptional()
    @IsString()
    @MaxLength(500)
    photoUrl?: string;

    // Previous Education
    @IsOptional()
    @IsString()
    @MaxLength(255)
    previousSchool?: string;

    @IsOptional()
    @IsString()
    @MaxLength(50)
    previousClass?: string;

    @IsOptional()
    @IsString()
    @MaxLength(100)
    transferCertificateNo?: string;

    // Transport
    @IsOptional()
    @IsBoolean()
    usesTransport?: boolean;

    @IsOptional()
    @IsUUID()
    transportRouteId?: string;

    // Section
    @IsOptional()
    @IsUUID()
    sectionId?: string;

    // Sibling
    @IsOptional()
    @IsUUID()
    siblingGroupId?: string;

    // Status
    @IsOptional()
    @IsEnum(StudentStatus)
    status?: StudentStatus;
}
