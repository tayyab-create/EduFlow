import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { School, User, RefreshToken, Organization } from './entities';
import { DatabaseSeeder } from './database.seeder';

@Module({
    imports: [
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                type: 'postgres',
                host: configService.get<string>('DATABASE_HOST', 'localhost'),
                port: configService.get<number>('DATABASE_PORT', 5432),
                username: configService.get<string>('DATABASE_USERNAME', 'postgres'),
                password: configService.get<string>('DATABASE_PASSWORD', 'postgres'),
                database: configService.get<string>('DATABASE_NAME', 'eduflow'),
                entities: [Organization, School, User, RefreshToken],
                synchronize: configService.get<string>('NODE_ENV') === 'development',
                logging: configService.get<string>('NODE_ENV') === 'development',
                autoLoadEntities: true,
            }),
        }),
        TypeOrmModule.forFeature([User]),
    ],
    providers: [DatabaseSeeder],
    exports: [TypeOrmModule],
})
export class DatabaseModule { }
