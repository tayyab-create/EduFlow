import { IsEmail, IsNotEmpty, IsString, MinLength, Matches } from 'class-validator';

/**
 * DTO for requesting a password reset.
 */
export class ForgotPasswordDto {
    @IsEmail()
    @IsNotEmpty()
    email: string;
}

/**
 * DTO for resetting password with token.
 */
export class ResetPasswordDto {
    @IsString()
    @IsNotEmpty()
    token: string;

    @IsString()
    @MinLength(8, { message: 'Password must be at least 8 characters' })
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
        message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
    })
    newPassword: string;
}
