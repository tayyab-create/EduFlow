import {
    Injectable,
    CanActivate,
    ExecutionContext,
    ForbiddenException,
} from '@nestjs/common';
import { UserRole } from '../../database/entities/user.entity';

/**
 * Guard that enforces multi-tenancy by ensuring users can only access
 * resources within their own school.
 * 
 * Super Admin can access all schools.
 * Other roles must have a school_id matching the resource.
 */
@Injectable()
export class TenantGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();
        const user = request.user;

        if (!user) {
            throw new ForbiddenException('User not authenticated');
        }

        // Super Admin can access all tenants
        if (user.role === UserRole.SUPER_ADMIN) {
            return true;
        }

        // Non-super-admin must have a school_id
        if (!user.schoolId) {
            throw new ForbiddenException('User is not associated with any school');
        }

        // Attach schoolId to request for use in services
        request.schoolId = user.schoolId;

        return true;
    }
}
