import {
    Injectable,
    NotFoundException,
    ConflictException,
    BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FeeType } from './entities/fee-type.entity';
import { FeeStructure } from './entities/fee-structure.entity';
import { StudentFee, StudentFeeStatus } from './entities/student-fee.entity';
import { Payment, PaymentStatus } from './entities/payment.entity';
import { Student, StudentStatus } from '../students/entities/student.entity';
import {
    CreateFeeTypeDto,
    CreateFeeStructureDto,
    GenerateStudentFeesDto,
    ApplyDiscountDto,
    CreatePaymentDto,
    UpdateFeeTypeDto,
    UpdateFeeStructureDto,
    QueryStudentFeesDto,
    QueryPaymentsDto,
} from './dto';
import {
    PaginatedResponse,
    createPaginatedResponse,
} from '../common/dto/pagination.dto';

@Injectable()
export class FeesService {
    constructor(
        @InjectRepository(FeeType)
        private readonly feeTypeRepository: Repository<FeeType>,
        @InjectRepository(FeeStructure)
        private readonly feeStructureRepository: Repository<FeeStructure>,
        @InjectRepository(StudentFee)
        private readonly studentFeeRepository: Repository<StudentFee>,
        @InjectRepository(Payment)
        private readonly paymentRepository: Repository<Payment>,
        @InjectRepository(Student)
        private readonly studentRepository: Repository<Student>,
    ) { }

    // ==================== FEE TYPES ====================

    async createFeeType(dto: CreateFeeTypeDto, schoolId: string): Promise<FeeType> {
        const existing = await this.feeTypeRepository.findOne({
            where: { schoolId, name: dto.name },
        });

        if (existing) {
            throw new ConflictException(`Fee type ${dto.name} already exists`);
        }

        const feeType = this.feeTypeRepository.create({ ...dto, schoolId });
        return this.feeTypeRepository.save(feeType);
    }

    async findAllFeeTypes(schoolId: string): Promise<FeeType[]> {
        return this.feeTypeRepository.find({
            where: { schoolId, isActive: true },
            order: { displayOrder: 'ASC', name: 'ASC' },
        });
    }

    async updateFeeType(id: string, dto: UpdateFeeTypeDto, schoolId: string): Promise<FeeType> {
        const feeType = await this.feeTypeRepository.findOne({ where: { id, schoolId } });
        if (!feeType) throw new NotFoundException('Fee type not found');
        Object.assign(feeType, dto);
        return this.feeTypeRepository.save(feeType);
    }

    // ==================== FEE STRUCTURES ====================

    async createFeeStructure(dto: CreateFeeStructureDto, schoolId: string): Promise<FeeStructure> {
        const existing = await this.feeStructureRepository.findOne({
            where: {
                feeTypeId: dto.feeTypeId,
                classId: dto.classId,
                academicYearId: dto.academicYearId,
            },
        });

        if (existing) {
            throw new ConflictException('Fee structure already exists for this class');
        }

        const structure = this.feeStructureRepository.create(dto);
        return this.feeStructureRepository.save(structure);
    }

    async findFeeStructures(classId: string, academicYearId: string): Promise<FeeStructure[]> {
        return this.feeStructureRepository.find({
            where: { classId, academicYearId, isActive: true },
            relations: ['feeType'],
            order: { feeType: { displayOrder: 'ASC' } },
        });
    }

    async updateFeeStructure(id: string, dto: UpdateFeeStructureDto): Promise<FeeStructure> {
        const structure = await this.feeStructureRepository.findOne({ where: { id } });
        if (!structure) throw new NotFoundException('Fee structure not found');
        Object.assign(structure, dto);
        return this.feeStructureRepository.save(structure);
    }

    // ==================== STUDENT FEES (INVOICES) ====================

    async generateStudentFees(dto: GenerateStudentFeesDto, schoolId: string): Promise<{ generated: number }> {
        const structure = await this.feeStructureRepository.findOne({
            where: { id: dto.feeStructureId },
            relations: ['feeType'],
        });

        if (!structure) {
            throw new NotFoundException('Fee structure not found');
        }

        // Get students in the class/section
        const studentQuery: any = {
            status: StudentStatus.ACTIVE,
            schoolId,
        };

        if (dto.sectionId) {
            studentQuery.sectionId = dto.sectionId;
        }

        const students = await this.studentRepository.find({ where: studentQuery });

        if (students.length === 0) {
            throw new BadRequestException('No active students found');
        }

        let generated = 0;
        const dueDate = new Date(dto.year, dto.month - 1, structure.dueDay);

        for (const student of students) {
            // Check if already generated
            const existing = await this.studentFeeRepository.findOne({
                where: {
                    studentId: student.id,
                    feeStructureId: structure.id,
                    month: dto.month,
                    year: dto.year,
                },
            });

            if (existing) continue;

            const studentFee = this.studentFeeRepository.create({
                studentId: student.id,
                feeStructureId: structure.id,
                termId: dto.termId,
                month: dto.month,
                year: dto.year,
                baseAmount: structure.amount,
                discountAmount: 0,
                lateFee: 0,
                netAmount: structure.amount,
                balanceAmount: structure.amount,
                dueDate,
                status: StudentFeeStatus.PENDING,
            });

            await this.studentFeeRepository.save(studentFee);
            generated++;
        }

        return { generated };
    }

    async findStudentFees(
        query: QueryStudentFeesDto,
        schoolId: string,
    ): Promise<PaginatedResponse<StudentFee>> {
        const queryBuilder = this.studentFeeRepository
            .createQueryBuilder('sf')
            .innerJoin('sf.student', 'student')
            .leftJoinAndSelect('sf.feeStructure', 'structure')
            .leftJoinAndSelect('structure.feeType', 'feeType')
            .where('student.school_id = :schoolId', { schoolId });

        if (query.studentId) {
            queryBuilder.andWhere('sf.student_id = :studentId', { studentId: query.studentId });
        }

        if (query.status) {
            queryBuilder.andWhere('sf.status = :status', { status: query.status });
        }

        if (query.month) {
            queryBuilder.andWhere('sf.month = :month', { month: query.month });
        }

        if (query.year) {
            queryBuilder.andWhere('sf.year = :year', { year: query.year });
        }

        queryBuilder.orderBy('sf.due_date', 'DESC');

        const total = await queryBuilder.getCount();
        queryBuilder.skip(query.skip).take(query.take);

        const fees = await queryBuilder.getMany();
        return createPaginatedResponse(fees, total, query);
    }

    async getStudentDues(studentId: string): Promise<StudentFee[]> {
        return this.studentFeeRepository.find({
            where: [
                { studentId, status: StudentFeeStatus.PENDING },
                { studentId, status: StudentFeeStatus.PARTIAL },
                { studentId, status: StudentFeeStatus.OVERDUE },
            ],
            relations: ['feeStructure', 'feeStructure.feeType'],
            order: { dueDate: 'ASC' },
        });
    }

    async applyDiscount(id: string, dto: ApplyDiscountDto, schoolId: string): Promise<StudentFee> {
        const fee = await this.studentFeeRepository.findOne({
            where: { id },
            relations: ['student'],
        });

        if (!fee) throw new NotFoundException('Student fee not found');

        fee.discountAmount = dto.discountAmount;
        fee.discountReason = dto.discountReason || '';
        fee.netAmount = Number(fee.baseAmount) - dto.discountAmount + Number(fee.lateFee);
        fee.balanceAmount = fee.netAmount - Number(fee.paidAmount);

        return this.studentFeeRepository.save(fee);
    }

    async waiveFee(id: string, reason: string, schoolId: string): Promise<StudentFee> {
        const fee = await this.studentFeeRepository.findOne({ where: { id } });
        if (!fee) throw new NotFoundException('Student fee not found');

        fee.status = StudentFeeStatus.WAIVED;
        fee.notes = reason;
        fee.balanceAmount = 0;

        return this.studentFeeRepository.save(fee);
    }

    // ==================== PAYMENTS ====================

    async createPayment(dto: CreatePaymentDto, receivedBy: string, schoolId: string): Promise<Payment> {
        // Generate receipt number
        const receiptNumber = await this.generateReceiptNumber(schoolId);

        const payment = this.paymentRepository.create({
            ...dto,
            receiptNumber,
            paymentDate: new Date(dto.paymentDate),
            receivedBy,
            status: PaymentStatus.COMPLETED,
        });

        const savedPayment = await this.paymentRepository.save(payment);

        // Update student fee if linked
        if (dto.studentFeeId) {
            await this.updateFeeAfterPayment(dto.studentFeeId, dto.amount);
        }

        return savedPayment;
    }

    private async updateFeeAfterPayment(studentFeeId: string, amount: number): Promise<void> {
        const fee = await this.studentFeeRepository.findOne({ where: { id: studentFeeId } });
        if (!fee) return;

        fee.paidAmount = Number(fee.paidAmount) + amount;
        fee.balanceAmount = fee.netAmount - fee.paidAmount;

        if (fee.balanceAmount <= 0) {
            fee.status = StudentFeeStatus.PAID;
            fee.paidDate = new Date();
        } else {
            fee.status = StudentFeeStatus.PARTIAL;
        }

        await this.studentFeeRepository.save(fee);
    }

    async findPayments(
        query: QueryPaymentsDto,
        schoolId: string,
    ): Promise<PaginatedResponse<Payment>> {
        const queryBuilder = this.paymentRepository
            .createQueryBuilder('payment')
            .innerJoin('payment.student', 'student')
            .where('student.school_id = :schoolId', { schoolId });

        if (query.studentId) {
            queryBuilder.andWhere('payment.student_id = :studentId', { studentId: query.studentId });
        }

        if (query.month && query.year) {
            const startDate = new Date(query.year, query.month - 1, 1);
            const endDate = new Date(query.year, query.month, 0);
            queryBuilder.andWhere('payment.payment_date BETWEEN :startDate AND :endDate', {
                startDate,
                endDate,
            });
        }

        queryBuilder.orderBy('payment.created_at', 'DESC');

        const total = await queryBuilder.getCount();
        queryBuilder.skip(query.skip).take(query.take);

        const payments = await queryBuilder.getMany();
        return createPaginatedResponse(payments, total, query);
    }

    async getPaymentsByStudent(studentId: string): Promise<Payment[]> {
        return this.paymentRepository.find({
            where: { studentId, status: PaymentStatus.COMPLETED },
            order: { paymentDate: 'DESC' },
        });
    }

    private async generateReceiptNumber(schoolId: string): Promise<string> {
        const today = new Date();
        const prefix = `RCP-${today.getFullYear()}${(today.getMonth() + 1).toString().padStart(2, '0')}`;

        const lastPayment = await this.paymentRepository
            .createQueryBuilder('p')
            .innerJoin('p.student', 's')
            .where('s.school_id = :schoolId', { schoolId })
            .andWhere('p.receipt_number LIKE :prefix', { prefix: `${prefix}%` })
            .orderBy('p.created_at', 'DESC')
            .getOne();

        let sequence = 1;
        if (lastPayment) {
            const lastNumber = parseInt(lastPayment.receiptNumber.split('-').pop() || '0');
            sequence = lastNumber + 1;
        }

        return `${prefix}-${sequence.toString().padStart(5, '0')}`;
    }

    // ==================== DASHBOARD STATS ====================

    async getCollectionSummary(schoolId: string, month: number, year: number) {
        const queryBuilder = this.studentFeeRepository
            .createQueryBuilder('sf')
            .innerJoin('sf.student', 'student')
            .where('student.school_id = :schoolId', { schoolId })
            .andWhere('sf.month = :month', { month })
            .andWhere('sf.year = :year', { year });

        const fees = await queryBuilder.getMany();

        return {
            totalDue: fees.reduce((sum, f) => sum + Number(f.netAmount), 0),
            totalCollected: fees.reduce((sum, f) => sum + Number(f.paidAmount), 0),
            totalPending: fees.reduce((sum, f) => sum + Number(f.balanceAmount), 0),
            studentsPaid: fees.filter(f => f.status === StudentFeeStatus.PAID).length,
            studentsPending: fees.filter(f => f.status === StudentFeeStatus.PENDING || f.status === StudentFeeStatus.PARTIAL).length,
        };
    }
}
