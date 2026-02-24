import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(private reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
            context.getHandler(),
            context.getClass(),
        ]);

        if (isPublic) return true;

        const request = context.switchToHttp().getRequest();
        const userId = request.headers['x-user-id'];
        const userRole = request.headers['x-user-role'];

        if (!userId || !userRole) {
            throw new UnauthorizedException('Authentication required (missing headers)');
        }

        // Attach user info to request
        request.user = { id: userId, role: userRole };

        const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (!requiredRoles || requiredRoles.length === 0) {
            return true;
        }

        if (!requiredRoles.includes(userRole)) {
            throw new ForbiddenException(`Require one of roles: ${requiredRoles.join(', ')}`);
        }

        return true;
    }
}
