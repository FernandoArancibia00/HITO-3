import { UserRole } from '../../users/entities/user.entity';

// Contenido del token según el contrato: { sub: userId, email, role }
export interface JwtPayload {
  sub: number;
  email: string;
  role: UserRole;
}
