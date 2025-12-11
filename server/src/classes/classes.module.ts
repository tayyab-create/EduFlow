import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClassesController, SectionsController } from './classes.controller';
import { ClassesService } from './classes.service';
import { Class, Section } from './entities';

@Module({
    imports: [TypeOrmModule.forFeature([Class, Section])],
    controllers: [ClassesController, SectionsController],
    providers: [ClassesService],
    exports: [ClassesService],
})
export class ClassesModule { }
