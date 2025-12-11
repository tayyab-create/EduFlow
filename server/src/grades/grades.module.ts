import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
    GradingScalesController,
    AssessmentsController,
    GradesController,
} from './grades.controller';
import { GradesService } from './grades.service';
import { GradingScale, Assessment, Grade } from './entities';

@Module({
    imports: [TypeOrmModule.forFeature([GradingScale, Assessment, Grade])],
    controllers: [GradingScalesController, AssessmentsController, GradesController],
    providers: [GradesService],
    exports: [GradesService],
})
export class GradesModule { }
