import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { Attendance } from '../attendance/entities/attendance.entity';
import { StudentFee } from '../fees/entities/student-fee.entity';
import { Payment } from '../fees/entities/payment.entity';
import { Grade } from '../grades/entities/grade.entity';
import { Student } from '../students/entities/student.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            Attendance,
            StudentFee,
            Payment,
            Grade,
            Student,
        ]),
    ],
    controllers: [ReportsController],
    providers: [ReportsService],
    exports: [ReportsService],
})
export class ReportsModule { }
