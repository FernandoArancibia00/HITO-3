import { ApiPropertyOptional } from '@nestjs/swagger';
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
import { MAX_INT } from './create-product.dto';

// Valida el campo solo si viene en el body. A diferencia de IsOptional, un null explícito
// sí se valida (y falla), porque esas columnas no aceptan null en la base
const IfPresent = () => ValidateIf((_, value) => value !== undefined);

// Los mismos campos de CreateProductDto, todos opcionales. No incluye isActive ni sellerId:
// con forbidNonWhitelisted, enviarlos responde 400
export class UpdateProductDto {
  @ApiPropertyOptional({ example: 'Calculadora Científica Casio FX-991' })
  @IfPresent()
  @IsString({ message: 'El título debe ser texto' })
  @IsNotEmpty({ message: 'El título es obligatorio' })
  @MaxLength(150, { message: 'El título no puede superar los 150 caracteres' })
  title?: string;

  @ApiPropertyOptional({ example: 'Casi nueva, con tapa protectora original.', minLength: 10 })
  @IfPresent()
  @IsString({ message: 'La descripción debe ser texto' })
  @MinLength(10, { message: 'La descripción debe tener al menos 10 caracteres' })
  description?: string;

  @ApiPropertyOptional({ example: 12000, description: 'Precio en CLP (entero > 0)' })
  @IfPresent()
  @IsInt({ message: 'El precio debe ser un número entero' })
  @Min(1, { message: 'El precio debe ser mayor a 0' })
  @Max(MAX_INT, { message: 'El precio es demasiado alto' })
  price?: number;

  @ApiPropertyOptional({ example: 2, minimum: 0 })
  @IfPresent()
  @IsInt({ message: 'El stock debe ser un número entero' })
  @Min(0, { message: 'El stock no puede ser negativo' })
  @Max(MAX_INT, { message: 'El stock es demasiado alto' })
  stock?: number;

  @ApiPropertyOptional({ enum: ProductCondition, example: ProductCondition.USADO })
  @IfPresent()
  @IsEnum(ProductCondition, { message: 'La condición debe ser nuevo o usado' })
  condition?: ProductCondition;

  // null borra la imagen (la columna es nullable)
  @ApiPropertyOptional({ example: 'https://ejemplo.cl/imagen.webp', nullable: true })
  @IsOptional()
  @IsUrl({}, { message: 'La URL de la imagen no es válida' })
  @MaxLength(500, { message: 'La URL de la imagen no puede superar los 500 caracteres' })
  imageUrl?: string | null;

  @ApiPropertyOptional({ example: 2 })
  @IfPresent()
  @IsInt({ message: 'La categoría debe ser un número entero' })
  @IsPositive({ message: 'La categoría no es válida' })
  categoryId?: number;
}
