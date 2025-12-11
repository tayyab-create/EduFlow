import {
    Controller,
    Get,
    Post,
    Patch,
    Param,
    Body,
    Query,
    ParseUUIDPipe,
    ParseIntPipe,
} from '@nestjs/common';
import { FeesService } from './fees.service';
import {
    CreateFeeTypeDto,
    CreateFeeStructureDto,
    GenerateStudentFeesDto,
    ApplyDiscountDto,
    WaiveFeeDto,
    CreatePaymentDto,
    UpdateFeeTypeDto,
    UpdateFeeStructureDto,
    QueryStudentFeesDto,
    QueryPaymentsDto,
} from './dto';
import { FeeType, FeeStructure, StudentFee, Payment } from './entities';
import { PaginatedResponse } from '../common/dto/pagination.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { User, UserRole } from '../database/entities/user.entity';

// ==================== FEE TYPES ====================

@Controller('fee-types')
export class FeeTypesController {
    constructor(private readonly feesService: FeesService) { }

    @Post()
    @Roles(UserRole.SUPER_ADMIN, UserRole.ORG_ADMIN, UserRole.SCHOOL_ADMIN)
    async create(@Body() dto: CreateFeeTypeDto, @CurrentUser() user: User): Promise<FeeType> {
        return this.feesService.createFeeType(dto, user.schoolId);
    }

    @Get()
    async findAll(@CurrentUser() user: User): Promise<FeeType[]> {
        return this.feesService.findAllFeeTypes(user.schoolId);
    }

    @Patch(':id')
    @Roles(UserRole.SUPER_ADMIN, UserRole.ORG_ADMIN, UserRole.SCHOOL_ADMIN)
    async update(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() dto: UpdateFeeTypeDto,
        @CurrentUser() user: User,
    ): Promise<FeeType> {
        return this.feesService.updateFeeType(id, dto, user.schoolId);
    }
}

// ==================== FEE STRUCTURES ====================

@Controller('fee-structures')
export class FeeStructuresController {
    constructor(private readonly feesService: FeesService) { }

    @Post()
    @Roles(UserRole.SUPER_ADMIN, UserRole.ORG_ADMIN, UserRole.SCHOOL_ADMIN)
    async create(@Body() dto: CreateFeeStructureDto, @CurrentUser() user: User): Promise<FeeStructure> {
        return this.feesService.createFeeStructure(dto, user.schoolId);
    }

    @Get('class/:classId/year/:academicYearId')
    async findByClass(
        @Param('classId', ParseUUIDPipe) classId: string,
        @Param('academicYearId', ParseUUIDPipe) academicYearId: string,
    ): Promise<FeeStructure[]> {
        return this.feesService.findFeeStructures(classId, academicYearId);
    }

    @Patch(':id')
    @Roles(UserRole.SUPER_ADMIN, UserRole.ORG_ADMIN, UserRole.SCHOOL_ADMIN)
    async update(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() dto: UpdateFeeStructureDto,
    ): Promise<FeeStructure> {
        return this.feesService.updateFeeStructure(id, dto);
    }
}

// ==================== STUDENT FEES ====================

@Controller('student-fees')
export class StudentFeesController {
    constructor(private readonly feesService: FeesService) { }

    @Post('generate')
    @Roles(UserRole.SUPER_ADMIN, UserRole.ORG_ADMIN, UserRole.SCHOOL_ADMIN, UserRole.ACCOUNTANT)
    async generate(
        @Body() dto: GenerateStudentFeesDto,
        @CurrentUser() user: User,
    ): Promise<{ generated: number }> {
        return this.feesService.generateStudentFees(dto, user.schoolId);
    }

    @Get()
    async findAll(
        @Query() query: QueryStudentFeesDto,
        @CurrentUser() user: User,
    ): Promise<PaginatedResponse<StudentFee>> {
        return this.feesService.findStudentFees(query, user.schoolId);
    }

    @Get('student/:studentId/dues')
    async getStudentDues(@Param('studentId', ParseUUIDPipe) studentId: string): Promise<StudentFee[]> {
        return this.feesService.getStudentDues(studentId);
    }

    @Post(':id/discount')
    @Roles(UserRole.SUPER_ADMIN, UserRole.ORG_ADMIN, UserRole.SCHOOL_ADMIN, UserRole.ACCOUNTANT)
    async applyDiscount(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() dto: ApplyDiscountDto,
        @CurrentUser() user: User,
    ): Promise<StudentFee> {
        return this.feesService.applyDiscount(id, dto, user.schoolId);
    }

    @Post(':id/waive')
    @Roles(UserRole.SUPER_ADMIN, UserRole.ORG_ADMIN, UserRole.SCHOOL_ADMIN)
    async waive(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() dto: WaiveFeeDto,
        @CurrentUser() user: User,
    ): Promise<StudentFee> {
        return this.feesService.waiveFee(id, dto.reason, user.schoolId);
    }

    @Get('summary/:month/:year')
    async getSummary(
        @Param('month', ParseIntPipe) month: number,
        @Param('year', ParseIntPipe) year: number,
        @CurrentUser() user: User,
    ) {
        return this.feesService.getCollectionSummary(user.schoolId, month, year);
    }
}

// ==================== PAYMENTS ====================

@Controller('payments')
export class PaymentsController {
    constructor(private readonly feesService: FeesService) { }

    @Post()
    @Roles(UserRole.SUPER_ADMIN, UserRole.ORG_ADMIN, UserRole.SCHOOL_ADMIN, UserRole.ACCOUNTANT)
    async create(@Body() dto: CreatePaymentDto, @CurrentUser() user: User): Promise<Payment> {
        return this.feesService.createPayment(dto, user.id, user.schoolId);
    }

    @Get()
    async findAll(
        @Query() query: QueryPaymentsDto,
        @CurrentUser() user: User,
    ): Promise<PaginatedResponse<Payment>> {
        return this.feesService.findPayments(query, user.schoolId);
    }

    @Get('student/:studentId')
    async getByStudent(@Param('studentId', ParseUUIDPipe) studentId: string): Promise<Payment[]> {
        return this.feesService.getPaymentsByStudent(studentId);
    }
}
