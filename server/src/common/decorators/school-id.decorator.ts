import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Decorator to extract the school ID from the authenticated user.
 * 
 * @example
 * @Get('students')
 * findAll(@SchoolId() schoolId: string) { ... }
 */
export const SchoolId = createParamDecorator(
    (data: unknown, ctx: ExecutionContext): string | null => {
        const request = ctx.switchToHttp().getRequest();
        return request.user?.schoolId || request.schoolId || null;
    },
);
