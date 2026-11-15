import { ApiProperty } from '@nestjs/swagger';
import { ProductResponseDto } from '../../products/dto/product-response.dto';
import { UserRole } from '../entities/user.entity';

// Estas clases solo documentan en Swagger la forma de las respuestas

// Perfil propio (GET y PATCH /users/me). Nunca incluye passwordHash
export class UserResponseDto {
  @ApiProperty({ example: 6 })
  id: number;

  @ApiProperty({ example: 'Pedro Soto' })
  name: string;

  @ApiProperty({ example: 'comprador1@unab.cl' })
  email: string;

  @ApiProperty({ enum: UserRole, example: UserRole.BUYER })
  role: UserRole;

  @ApiProperty({ example: 'Ingeniería Civil Informática', nullable: true })
  career: string | null;

  @ApiProperty({ example: 'República', nullable: true })
  campus: string | null;

  @ApiProperty({ example: '+56911112222', nullable: true })
  phone: string | null;

  @ApiProperty({ example: '2026-11-10T12:00:00.000Z' })
  createdAt: Date;
}

// Perfil público (GET /users/:id): sin correo, teléfono ni rol
export class PublicProfileDto {
  @ApiProperty({ example: 3 })
  id: number;

  @ApiProperty({ example: 'María González' })
  name: string;

  @ApiProperty({ example: 'Arquitectura', nullable: true })
  career: string | null;

  @ApiProperty({ example: 'Los Leones', nullable: true })
  campus: string | null;

  @ApiProperty({
    type: [ProductResponseDto],
    description: 'Solo productos activos y con stock',
  })
  products: ProductResponseDto[];
}
