import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// Uso: @UseGuards(JwtAuthGuard) en un controlador o método. Sin token o con token inválido → 401
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  // Reemplaza el "Unauthorized" genérico de Passport por un mensaje en español
  handleRequest<TUser>(err: unknown, user: TUser | false): TUser {
    if (err || !user) {
      throw new UnauthorizedException('Debes iniciar sesión o tu sesión expiró');
    }
    return user;
  }
}
