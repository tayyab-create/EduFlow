import {
    Controller,
    Post,
    Body,
    Get,
    HttpCode,
    HttpStatus,
    Req,
    UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { AuthService, AuthResponse, AuthTokens } from './auth.service';
import { LoginDto, RegisterDto, RefreshTokenDto } from './dto';
import { JwtAuthGuard } from './guards';
import { Public } from '../common/decorators/public.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../database/entities/user.entity';

@Controller('api/v1/auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Public()
    @Post('register')
    async register(@Body() dto: RegisterDto): Promise<{ success: boolean; message: string; data: AuthResponse }> {
        const result = await this.authService.register(dto);
        return {
            success: true,
            message: 'Registration successful',
            data: result,
        };
    }

    @Public()
    @Post('login')
    @HttpCode(HttpStatus.OK)
    async login(@Body() dto: LoginDto, @Req() req: Request): Promise<{ success: boolean; message: string; data: AuthResponse }> {
        const ipAddress = req.ip || req.socket.remoteAddress;
        const userAgent = req.get('User-Agent');

        const result = await this.authService.login(dto, ipAddress, userAgent);
        return {
            success: true,
            message: 'Login successful',
            data: result,
        };
    }

    @Public()
    @Post('refresh')
    @HttpCode(HttpStatus.OK)
    async refreshTokens(@Body() dto: RefreshTokenDto): Promise<{ success: boolean; message: string; data: AuthTokens }> {
        const tokens = await this.authService.refreshTokens(dto);
        return {
            success: true,
            message: 'Tokens refreshed',
            data: tokens,
        };
    }

    @UseGuards(JwtAuthGuard)
    @Post('logout')
    @HttpCode(HttpStatus.OK)
    async logout(@CurrentUser('id') userId: string, @Body() body: { refreshToken?: string }): Promise<{ success: boolean; message: string }> {
        await this.authService.logout(userId, body.refreshToken);
        return {
            success: true,
            message: 'Logout successful',
        };
    }

    @UseGuards(JwtAuthGuard)
    @Get('me')
    async getProfile(@CurrentUser('id') userId: string): Promise<{ success: boolean; data: Partial<User> }> {
        const user = await this.authService.getProfile(userId);
        return {
            success: true,
            data: user,
        };
    }
}
