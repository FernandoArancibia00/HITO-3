import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// Para rutas públicas que quieren saber si hay alguien conectado (ej. registrar actividad).
// Token válido → llena req.user. Sin token, o con token inválido/expirado → sigue como
// anónimo (req.user queda undefined) en vez de responder 401
@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  handleRequest<TUser>(_err: unknown, user: TUser | false): TUser {
    return (user || undefined) as TUser;
  }
}
