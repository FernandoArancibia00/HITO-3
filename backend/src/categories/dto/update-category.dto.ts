import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

// Sin slug a propósito: con forbidNonWhitelisted, enviar "slug" en el PATCH responde 400
export class UpdateCategoryDto {
  @ApiPropertyOptional({ example: 'Ropa, Calzado y Accesorios' })
  @IsOptional()
  @IsString({ message: 'El nombre debe ser texto' })
  @IsNotEmpty({ message: 'El nombre no puede estar vacío' })
  @MaxLength(100, { message: 'El nombre no puede superar los 100 caracteres' })
  name?: string;

  @ApiPropertyOptional({ example: 'bag', description: 'Nombre de un ícono de Bootstrap Icons' })
  @IsOptional()
  @IsString({ message: 'El ícono debe ser texto' })
  @IsNotEmpty({ message: 'El ícono no puede estar vacío' })
  @MaxLength(50, { message: 'El ícono no puede superar los 50 caracteres' })
  icon?: string;
}
