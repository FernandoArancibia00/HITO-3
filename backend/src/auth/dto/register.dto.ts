import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'Camila Rojas', description: 'Nombre completo' })
  @IsString({ message: 'El nombre debe ser texto' })
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @MaxLength(100, { message: 'El nombre no puede superar los 100 caracteres' })
  name: string;

  @ApiProperty({ example: 'camila.rojas@unab.cl' })
  @IsEmail({}, { message: 'El correo no tiene un formato válido' })
  @MaxLength(150, { message: 'El correo no puede superar los 150 caracteres' })
  email: string;

  @ApiProperty({ example: 'Password123', minLength: 8 })
  @IsString({ message: 'La contraseña debe ser texto' })
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  password: string;

  @ApiPropertyOptional({ example: 'Ingeniería Comercial' })
  @IsOptional()
  @IsString({ message: 'La carrera debe ser texto' })
  @MaxLength(100, { message: 'La carrera no puede superar los 100 caracteres' })
  career?: string;

  @ApiPropertyOptional({ example: 'Casona' })
  @IsOptional()
  @IsString({ message: 'El campus debe ser texto' })
  @MaxLength(100, { message: 'El campus no puede superar los 100 caracteres' })
  campus?: string;

  @ApiPropertyOptional({ example: '+56987654321' })
  @IsOptional()
  @IsString({ message: 'El teléfono debe ser texto' })
  @MaxLength(30, { message: 'El teléfono no puede superar los 30 caracteres' })
  phone?: string;
}
