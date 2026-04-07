import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { UserRole } from '@saas-erp/shared';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Pas de restriction de rôle → accès libre (JWT valide suffit)
    if (!requiredRoles || requiredRoles.length === 0) return true;

    const { user } = context.switchToHttp().getRequest();
    if (!user) throw new ForbiddenException('Non authentifié');

    const hasRole = requiredRoles.includes(user.role as UserRole);
    if (!hasRole) {
      throw new ForbiddenException(`Rôle requis : ${requiredRoles.join(' ou ')}`);
    }

    return true;
  }
}
