import {
    Injectable,
    UnauthorizedException,
    ConflictException,
    BadRequestException,
    NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { User, UserStatus, UserRole } from '../database/entities/user.entity';
import { RefreshToken } from '../database/entities/refresh-token.entity';
import { School } from '../database/entities/school.entity';
import { LoginDto, RegisterDto, RefreshTokenDto } from './dto';
import { JwtPayload } from './strategies/jwt.strategy';

export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
}

export interface AuthResponse {
    user: Partial<User>;
    tokens: AuthTokens;
}

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
        @InjectRepository(RefreshToken)
        private refreshTokenRepository: Repository<RefreshToken>,
        @InjectRepository(School)
        private schoolRepository: Repository<School>,
        private jwtService: JwtService,
        private configService: ConfigService,
    ) { }

    async register(dto: RegisterDto): Promise<AuthResponse> {
        // Resolve school ID from various sources
        let schoolId = dto.schoolId;

        // If schoolCode provided, look up the school
        if (!schoolId && dto.schoolCode) {
            const school = await this.schoolRepository.findOne({
                where: { code: dto.schoolCode, isActive: true },
            });
            if (!school) {
                throw new NotFoundException(`School with code ${dto.schoolCode} not found`);
            }
            schoolId = school.id;
        }

        // If schoolName provided, create a new school (for school admin registration)
        if (!schoolId && dto.schoolName) {
            const schoolCode = this.generateSchoolCode(dto.schoolName);
            const existingSchool = await this.schoolRepository.findOne({
                where: { code: schoolCode },
            });
            if (existingSchool) {
                throw new ConflictException(`School code ${schoolCode} already exists. Please use a different name.`);
            }

            const newSchool = this.schoolRepository.create({
                name: dto.schoolName,
                code: schoolCode,
            });
            await this.schoolRepository.save(newSchool);
            schoolId = newSchool.id;
        }

        // Check if email already exists (within school scope if applicable)
        const whereClause: any = { email: dto.email };
        if (schoolId) {
            whereClause.schoolId = schoolId;
        }
        const existingUser = await this.userRepository.findOne({
            where: whereClause,
        });

        if (existingUser) {
            throw new ConflictException('Email already registered');
        }

        // Hash password
        const passwordHash = await bcrypt.hash(dto.password, 12);

        // Create user
        const user = this.userRepository.create({
            email: dto.email,
            passwordHash,
            firstName: dto.firstName,
            lastName: dto.lastName,
            phone: dto.phone,
            role: dto.role || (schoolId ? UserRole.SCHOOL_ADMIN : UserRole.SUPER_ADMIN),
            status: UserStatus.ACTIVE, // For dev, auto-activate
            schoolId,
        });

        await this.userRepository.save(user);

        // Generate tokens
        const tokens = await this.generateTokens(user);

        return {
            user: this.sanitizeUser(user),
            tokens,
        };
    }

    /**
     * Generate a school code from school name.
     */
    private generateSchoolCode(name: string): string {
        const prefix = name
            .split(' ')
            .map((w) => w.charAt(0).toUpperCase())
            .join('')
            .slice(0, 3);
        const suffix = Math.random().toString(36).substring(2, 5).toUpperCase();
        return `${prefix}-${suffix}`;
    }

    async login(dto: LoginDto, ipAddress?: string, userAgent?: string): Promise<AuthResponse> {
        const user = await this.userRepository.findOne({
            where: { email: dto.email },
            relations: ['school'],
        });

        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        // Check if account is locked
        if (user.lockedUntil && new Date(user.lockedUntil) > new Date()) {
            throw new UnauthorizedException('Account is temporarily locked. Please try again later.');
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);

        if (!isPasswordValid) {
            // Increment failed attempts
            user.failedLoginAttempts += 1;

            // Lock account after 5 failed attempts for 15 minutes
            if (user.failedLoginAttempts >= 5) {
                user.lockedUntil = new Date(Date.now() + 15 * 60 * 1000);
            }

            await this.userRepository.save(user);
            throw new UnauthorizedException('Invalid credentials');
        }

        // Check user status
        if (user.status !== UserStatus.ACTIVE) {
            throw new UnauthorizedException(`Account is ${user.status}`);
        }

        // Reset failed attempts and update login info
        user.failedLoginAttempts = 0;
        user.lockedUntil = undefined as any; // Reset lock
        user.lastLoginAt = new Date();
        user.lastLoginIp = ipAddress || undefined as any;
        await this.userRepository.save(user);

        // Generate tokens
        const tokens = await this.generateTokens(user, ipAddress, userAgent);

        return {
            user: this.sanitizeUser(user),
            tokens,
        };
    }

    async refreshTokens(dto: RefreshTokenDto): Promise<AuthTokens> {
        // Hash the incoming refresh token to compare with stored hash
        const tokenHash = crypto.createHash('sha256').update(dto.refreshToken).digest('hex');

        const storedToken = await this.refreshTokenRepository.findOne({
            where: { tokenHash },
            relations: ['user'],
        });

        if (!storedToken) {
            throw new UnauthorizedException('Invalid refresh token');
        }

        if (!storedToken.isValid) {
            throw new UnauthorizedException('Refresh token has expired or been revoked');
        }

        // Revoke old token
        storedToken.revokedAt = new Date();
        storedToken.revokedReason = 'token_refresh';
        await this.refreshTokenRepository.save(storedToken);

        // Generate new tokens
        return this.generateTokens(storedToken.user);
    }

    async logout(userId: string, refreshToken?: string): Promise<void> {
        if (refreshToken) {
            const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
            await this.refreshTokenRepository.update(
                { tokenHash },
                { revokedAt: new Date(), revokedReason: 'logout' },
            );
        } else {
            // Revoke all refresh tokens for user - use IsNull() for TypeORM
            await this.refreshTokenRepository.update(
                { userId, revokedAt: IsNull() },
                { revokedAt: new Date(), revokedReason: 'logout_all' },
            );
        }
    }

    async getProfile(userId: string): Promise<Partial<User>> {
        const user = await this.userRepository.findOne({
            where: { id: userId },
            relations: ['school', 'organization'],
        });

        if (!user) {
            throw new BadRequestException('User not found');
        }

        return this.sanitizeUser(user);
    }

    private async generateTokens(
        user: User,
        ipAddress?: string,
        userAgent?: string,
    ): Promise<AuthTokens> {
        // Generate dynamic permissions based on role
        const permissions = this.generatePermissionsForRole(user.role);

        const payload: JwtPayload = {
            sub: user.id,
            email: user.email,
            role: user.role,
            organizationId: user.organizationId,  // ✅ Added
            schoolId: user.schoolId,
            permissions,  // ✅ Added
        };

        const expiresInSeconds = 900; // 15 minutes

        const accessToken = this.jwtService.sign(payload as any, {
            secret: this.configService.get<string>('JWT_SECRET'),
            expiresIn: expiresInSeconds,
        });

        // Generate refresh token
        const refreshToken = crypto.randomBytes(64).toString('hex');
        const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');

        // Calculate expiry (7 days)
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);

        // Store refresh token
        const refreshTokenEntity = this.refreshTokenRepository.create({
            userId: user.id,
            tokenHash,
            expiresAt,
            ipAddress,
            userAgent,
        });
        await this.refreshTokenRepository.save(refreshTokenEntity);

        return {
            accessToken,
            refreshToken,
            expiresIn: expiresInSeconds,
        };
    }

    private sanitizeUser(user: User): Partial<User> {
        const { passwordHash, twoFactorSecret, ...sanitized } = user;
        return sanitized;
    }

    /**
     * Generate permissions array based on user role
     * This provides fine-grained access control beyond role-based checks
     */
    private generatePermissionsForRole(role: UserRole): string[] {
        const permissionMap: Record<UserRole, string[]> = {
            [UserRole.SUPER_ADMIN]: [
                'read:*', 'write:*', 'delete:*', // Full access
                'manage:organizations', 'manage:schools', 'manage:users',
            ],
            [UserRole.ORG_ADMIN]: [
                'read:org-wide', 'write:org-wide',
                'manage:schools', 'manage:school-admins', 'create:org-admins',
                'read:students', 'read:staff', 'read:reports',
            ],
            [UserRole.SCHOOL_ADMIN]: [
                'read:school', 'write:school',
                'manage:staff', 'manage:students', 'manage:classes',
                'read:attendance', 'write:attendance',
                'read:grades', 'write:grades',
                'read:fees', 'write:fees',
                'read:reports', 'create:reports',
            ],
            [UserRole.PRINCIPAL]: [
                'read:school', 'write:school',
                'read:students', 'write:students',
                'read:attendance', 'write:attendance',
                'read:grades', 'write:grades', 'publish:grades',
                'read:fees', 'write:fees',
                'read:reports', 'create:reports',
            ],
            [UserRole.VICE_PRINCIPAL]: [
                'read:school',
                'read:students', 'write:students',
                'read:attendance', 'write:attendance',
                'read:grades', 'write:grades',
                'read:fees',
                'read:reports',
            ],
            [UserRole.TEACHER]: [
                'read:own-classes',
                'read:students:assigned',
                'write:attendance:assigned',
                'write:grades:own-subjects',
                'read:timetable',
                'send:messages',
            ],
            [UserRole.ACCOUNTANT]: [
                'read:school',
                'read:students',
                'read:fees', 'write:fees', 'manage:fees',
                'read:payments', 'write:payments',
                'read:financial-reports', 'create:financial-reports',
            ],
            [UserRole.HR]: [
                'read:staff', 'write:staff', 'create:staff',
                'read:leave-requests', 'approve:leave-requests',
            ],
            [UserRole.LIBRARIAN]: [
                'read:students', 'read:staff',
                'manage:library',
            ],
            [UserRole.RECEPTIONIST]: [
                'read:students', 'create:students',
                'read:visitors', 'write:visitors',
            ],
            [UserRole.PARENT]: [
                'read:own-children',
                'read:attendance:own-children',
                'read:grades:own-children',
                'read:fees:own-children', 'pay:fees',
                'send:messages:teachers',
            ],
            [UserRole.STUDENT]: [
                'read:self',
                'read:attendance:self',
                'read:grades:self',
                'read:timetable:self',
                'send:messages:teachers',
            ],
        };

        return permissionMap[role] || [];
    }
}
