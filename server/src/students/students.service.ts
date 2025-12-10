import {
    Injectable,
    NotFoundException,
    ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Student } from './entities/student.entity';
import { CreateStudentDto, UpdateStudentDto, QueryStudentsDto } from './dto';
import {
    PaginatedResponse,
    createPaginatedResponse,
} from '../common/dto/pagination.dto';

/**
 * Service for managing student records.
 * All methods enforce multi-tenancy via schoolId parameter.
 */
@Injectable()
export class StudentsService {
    constructor(
        @InjectRepository(Student)
        private readonly studentRepository: Repository<Student>,
    ) { }

    /**
     * Create a new student within a school.
     */
    async create(
        createStudentDto: CreateStudentDto,
        schoolId: string,
    ): Promise<Student> {
        // Check for duplicate registration number
        if (createStudentDto.registrationNo) {
            const existing = await this.studentRepository.findOne({
                where: {
                    schoolId,
                    registrationNo: createStudentDto.registrationNo,
                },
            });

            if (existing) {
                throw new ConflictException(
                    `Student with registration number ${createStudentDto.registrationNo} already exists`,
                );
            }
        }

        const student = this.studentRepository.create({
            ...createStudentDto,
            schoolId,
        });

        return this.studentRepository.save(student);
    }

    /**
     * Find all students with pagination and filtering.
     */
    async findAll(
        query: QueryStudentsDto,
        schoolId: string,
    ): Promise<PaginatedResponse<Student>> {
        const queryBuilder = this.studentRepository
            .createQueryBuilder('student')
            .where('student.school_id = :schoolId', { schoolId })
            .andWhere('student.deleted_at IS NULL');

        // Search filter
        if (query.search) {
            queryBuilder.andWhere(
                '(student.first_name ILIKE :search OR student.last_name ILIKE :search OR student.registration_no ILIKE :search)',
                { search: `%${query.search}%` },
            );
        }

        // Status filter
        if (query.status) {
            queryBuilder.andWhere('student.status = :status', {
                status: query.status,
            });
        }

        // Section filter
        if (query.sectionId) {
            queryBuilder.andWhere('student.section_id = :sectionId', {
                sectionId: query.sectionId,
            });
        }

        // Gender filter
        if (query.gender) {
            queryBuilder.andWhere('student.gender = :gender', {
                gender: query.gender,
            });
        }

        // City filter
        if (query.city) {
            queryBuilder.andWhere('student.city ILIKE :city', {
                city: `%${query.city}%`,
            });
        }

        // Sorting
        const sortColumn = this.getSortColumn(query.sortBy);
        queryBuilder.orderBy(sortColumn, query.order);

        // Get total count
        const total = await queryBuilder.getCount();

        // Apply pagination
        queryBuilder.skip(query.skip).take(query.take);

        const students = await queryBuilder.getMany();

        return createPaginatedResponse(students, total, query);
    }

    /**
     * Find a single student by ID within a school.
     */
    async findOne(id: string, schoolId: string): Promise<Student> {
        const student = await this.studentRepository.findOne({
            where: { id, schoolId },
        });

        if (!student) {
            throw new NotFoundException(`Student with ID ${id} not found`);
        }

        return student;
    }

    /**
     * Update a student.
     */
    async update(
        id: string,
        updateStudentDto: UpdateStudentDto,
        schoolId: string,
    ): Promise<Student> {
        const student = await this.findOne(id, schoolId);

        // Check for duplicate registration number if updating it
        if (
            updateStudentDto.registrationNo &&
            updateStudentDto.registrationNo !== student.registrationNo
        ) {
            const existing = await this.studentRepository.findOne({
                where: {
                    schoolId,
                    registrationNo: updateStudentDto.registrationNo,
                },
            });

            if (existing) {
                throw new ConflictException(
                    `Student with registration number ${updateStudentDto.registrationNo} already exists`,
                );
            }
        }

        Object.assign(student, updateStudentDto);
        return this.studentRepository.save(student);
    }

    /**
     * Soft delete a student.
     */
    async remove(id: string, schoolId: string): Promise<void> {
        const student = await this.findOne(id, schoolId);
        await this.studentRepository.softRemove(student);
    }

    /**
     * Get count of students by status.
     */
    async countByStatus(schoolId: string): Promise<Record<string, number>> {
        const result = await this.studentRepository
            .createQueryBuilder('student')
            .select('student.status', 'status')
            .addSelect('COUNT(*)', 'count')
            .where('student.school_id = :schoolId', { schoolId })
            .andWhere('student.deleted_at IS NULL')
            .groupBy('student.status')
            .getRawMany();

        return result.reduce(
            (acc, row) => {
                acc[row.status] = parseInt(row.count, 10);
                return acc;
            },
            {} as Record<string, number>,
        );
    }

    /**
     * Map sort field to actual column name.
     */
    private getSortColumn(sortBy: string): string {
        const sortMap: Record<string, string> = {
            createdAt: 'student.created_at',
            firstName: 'student.first_name',
            lastName: 'student.last_name',
            admissionDate: 'student.admission_date',
            registrationNo: 'student.registration_no',
            rollNumber: 'student.roll_number',
        };

        return sortMap[sortBy] || 'student.created_at';
    }
}
