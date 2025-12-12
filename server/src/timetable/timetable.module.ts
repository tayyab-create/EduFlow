import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TimetableService } from './timetable.service';
import { TimetableController } from './timetable.controller';
import { Period, TimetableEntry } from './entities';

@Module({
    imports: [TypeOrmModule.forFeature([Period, TimetableEntry])],
    controllers: [TimetableController],
    providers: [TimetableService],
    exports: [TimetableService],
})
export class TimetableModule { }
