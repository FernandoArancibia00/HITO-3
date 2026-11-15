import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { QueryFailedError } from 'typeorm';
import { JwtPayload } from '../common/interfaces/jwt-payload.interface';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { AuthResponseDto } from './dto/auth-response.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

const BCRYPT_ROUNDS = 10;
const EMAIL_IN_USE_MESSAGE = 'El correo ya está registrado';
const INVALID_CREDENTIALS_MESSAGE = 'Credenciales inválidas';
// Código de Postgres para violación de restricción UNIQUE
const PG_UNIQUE_VIOLATION = '23505';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthResponseDto> {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException(EMAIL_IN_USE_MESSAGE);
    }

    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);

    let user: User;
    try {
      user = await this.usersService.create({
        name: dto.name,
        email: dto.email,
        passwordHash,
        career: dto.career ?? null,
        campus: dto.campus ?? null,
        phone: dto.phone ?? null,
      });
    } catch (error) {
      // Dos registros simultáneos con el mismo correo: la base rechaza el segundo
      if (
        error instanceof QueryFailedError &&
        (error as QueryFailedError & { code?: string }).code ===
          PG_UNIQUE_VIOLATION
      ) {
        throw new ConflictException(EMAIL_IN_USE_MESSAGE);
      }
      throw error;
    }

    return this.buildAuthResponse(user);
  }

  async login(dto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.usersService.findByEmailWithPassword(dto.email);

    // Mismo mensaje si falla el correo o la contraseña, para no revelar qué correos existen
    const passwordOk =
      user !== null && (await bcrypt.compare(dto.password, user.passwordHash));
    if (!user || !passwordOk) {
      throw new UnauthorizedException(INVALID_CREDENTIALS_MESSAGE);
    }

    return this.buildAuthResponse(user);
  }

  private buildAuthResponse(user: User): AuthResponseDto {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        career: user.career,
        campus: user.campus,
      },
    };
  }
}
