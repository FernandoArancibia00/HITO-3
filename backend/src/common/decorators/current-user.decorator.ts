import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

// Uso: @CurrentUser() user: JwtPayload  o  @CurrentUser('sub') userId: number
// Requiere JwtAuthGuard, que es quien deja el payload en req.user
export const CurrentUser = createParamDecorator(
  (field: keyof JwtPayload | undefined, context: ExecutionContext) => {
    const user = context.switchToHttp().getRequest().user as JwtPayload;
    return field ? user?.[field] : user;
  },
);
