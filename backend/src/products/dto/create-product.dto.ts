import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  IsUrl,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateIf,
} from 'class-validator';
import { ProductCondition } from '../entities/product.entity';

// Máximo de una columna int de Postgres: evita un error 500 si llega un número enorme
export const MAX_INT = 2_147_483_647;

export class CreateProductDto {
  @ApiProperty({ example: 'Calculadora Científica Casio FX-991' })
  @IsString({ message: 'El título debe ser texto' })
  @IsNotEmpty({ message: 'El título es obligatorio' })
  @MaxLength(150, { message: 'El título no puede superar los 150 caracteres' })
  title: string;

  @ApiProperty({
    example:
      'Casi nueva, la vendo porque me regalaron otra. Batería operativa e incluye tapa protectora original.',
    minLength: 10,
  })
  @IsString({ message: 'La descripción debe ser texto' })
  @MinLength(10, { message: 'La descripción debe tener al menos 10 caracteres' })
  description: string;

  @ApiProperty({ example: 15000, description: 'Precio en CLP (entero > 0)' })
  @IsInt({ message: 'El precio debe ser un número entero' })
  @Min(1, { message: 'El precio debe ser mayor a 0' })
  @Max(MAX_INT, { message: 'El precio es demasiado alto' })
  price: number;

  // Opcional: si no viene, la base usa el valor por defecto 1.
  // ValidateIf (y no IsOptional) para que un null explícito responda 400 en vez de llegar a la base
  @ApiPropertyOptional({ example: 1, default: 1, minimum: 0 })
  @ValidateIf((_, value) => value !== undefined)
  @IsInt({ message: 'El stock debe ser un número entero' })
  @Min(0, { message: 'El stock no puede ser negativo' })
  @Max(MAX_INT, { message: 'El stock es demasiado alto' })
  stock?: number;

  @ApiProperty({ enum: ProductCondition, example: ProductCondition.USADO })
  @IsEnum(ProductCondition, { message: 'La condición debe ser nuevo o usado' })
  condition: ProductCondition;

  @ApiPropertyOptional({
    example:
      'https://calculadoras-production.s3.sa-east-1.amazonaws.com/images/991ESPLUSNEGRA.webp',
    nullable: true,
  })
  @IsOptional()
  @IsUrl({}, { message: 'La URL de la imagen no es válida' })
  @MaxLength(500, { message: 'La URL de la imagen no puede superar los 500 caracteres' })
  imageUrl?: string | null;

  @ApiProperty({ example: 2 })
  @IsInt({ message: 'La categoría debe ser un número entero' })
  @IsPositive({ message: 'La categoría es obligatoria' })
  categoryId: number;
}
