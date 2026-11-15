import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  ValidateIf,
} from 'class-validator';

// Solo estos 4 campos: email y role no están declarados, así que el ValidationPipe
// global (forbidNonWhitelisted) responde 400 si vienen en el body
export class UpdateUserDto {
  // ValidateIf en vez de IsOptional: IsOptional también deja pasar null, y name es NOT NULL
  @ApiPropertyOptional({ example: 'Pedro Soto' })
  @ValidateIf((_, value) => value !== undefined)
  @IsString({ message: 'El nombre debe ser texto' })
  @IsNotEmpty({ message: 'El nombre no puede estar vacío' })
  @MaxLength(100, { message: 'El nombre no puede superar los 100 caracteres' })
  name?: string;

  // En career, campus y phone un texto vacío borra el dato (se guarda null)
  @ApiPropertyOptional({ example: 'Ingeniería Civil Informática' })
  @IsOptional()
  @IsString({ message: 'La carrera debe ser texto' })
  @MaxLength(100, { message: 'La carrera no puede superar los 100 caracteres' })
  career?: string;

  @ApiPropertyOptional({ example: 'República' })
  @IsOptional()
  @IsString({ message: 'El campus debe ser texto' })
  @MaxLength(100, { message: 'El campus no puede superar los 100 caracteres' })
  campus?: string;

  @ApiPropertyOptional({ example: '+56911112222' })
  @IsOptional()
  @IsString({ message: 'El teléfono debe ser texto' })
  @MaxLength(30, { message: 'El teléfono no puede superar los 30 caracteres' })
  phone?: string;
}
