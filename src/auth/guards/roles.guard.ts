import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }
    
    const { user } = context.switchToHttp().getRequest();
    if (!user) {
      return false;
    }
    
    // Check role access - handle both string and object format
    if (typeof user.role === 'string') {
      return requiredRoles.includes(user.role);
    } else if (user.role && typeof user.role === 'object' && 'name' in user.role) {
      return requiredRoles.includes(user.role.name);
    }
    
    return false;
  }
} 