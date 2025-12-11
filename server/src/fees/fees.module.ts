import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
    FeeTypesController,
    FeeStructuresController,
    StudentFeesController,
    PaymentsController,
} from './fees.controller';
import { FeesService } from './fees.service';
import { FeeType, FeeStructure, StudentFee, Payment } from './entities';
import { Student } from '../students/entities/student.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([FeeType, FeeStructure, StudentFee, Payment, Student]),
    ],
    controllers: [
        FeeTypesController,
        FeeStructuresController,
        StudentFeesController,
        PaymentsController,
    ],
    providers: [FeesService],
    exports: [FeesService],
})
export class FeesModule { }
