import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../database/entities/user.entity';

export interface JwtPayload {
    sub: string;           // User ID
    email: string;         // User email
    role: string;          // User role
    organizationId?: string;  // Organization ID (for org admins)
    schoolId?: string;     // School ID (for school-level users)
    permissions?: string[];   // Dynamic permissions array
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        private configService: ConfigService,
        @InjectRepository(User)
        private userRepository: Repository<User>,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get<string>('JWT_SECRET', 'dev-secret'),
        });
    }

    async validate(payload: JwtPayload): Promise<User> {
        const user = await this.userRepository.findOne({
            where: { id: payload.sub },
            relations: ['school', 'organization'],
        });

        if (!user) {
            throw new UnauthorizedException('User not found');
        }

        if (user.status !== 'active') {
            throw new UnauthorizedException('User account is not active');
        }

        return user;
    }
}
