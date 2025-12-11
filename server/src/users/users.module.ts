import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from '../database/entities/user.entity';
import { School } from '../database/entities/school.entity';
import { Organization } from '../database/entities/organization.entity';

@Module({
    imports: [TypeOrmModule.forFeature([User, School, Organization])],
    controllers: [UsersController],
    providers: [UsersService],
    exports: [UsersService],
})
export class UsersModule { }
