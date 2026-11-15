import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '../../users/entities/user.entity';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

// Debe ir DESPUÉS de JwtAuthGuard: @UseGuards(JwtAuthGuard, RolesGuard)
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Busca @Roles() primero en el método y luego en el controlador
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // Sin @Roles() la ruta solo exige estar autenticado
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const user = context.switchToHttp().getRequest().user as
      | JwtPayload
      | undefined;

    if (!user || !requiredRoles.includes(user.role)) {
      throw new ForbiddenException('No tienes permiso para realizar esta acción');
    }
    return true;
  }
}
