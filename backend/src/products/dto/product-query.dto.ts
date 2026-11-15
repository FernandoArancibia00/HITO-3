import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { ProductCondition } from '../entities/product.entity';
import { MAX_INT } from './create-product.dto';

export enum ProductSort {
  RECENT = 'recent',
  PRICE_ASC = 'price_asc',
  PRICE_DESC = 'price_desc',
}

// Los query params llegan como texto: @Type(() => Number) los convierte antes de validar.
// minPrice <= maxPrice se valida en el servicio (compara dos campos)
export class ProductQueryDto {
  @ApiPropertyOptional({
    example: 'calculadora',
    description: 'Busca en título, descripción y nombre del vendedor (sin distinguir mayúsculas)',
  })
  @IsOptional()
  @IsString({ message: 'La búsqueda debe ser texto' })
  @MaxLength(100, { message: 'La búsqueda no puede superar los 100 caracteres' })
  search?: string;

  @ApiPropertyOptional({ example: 'tecnologia', description: 'slug de la categoría' })
  @IsOptional()
  @IsString({ message: 'La categoría debe ser texto' })
  @MaxLength(50, { message: 'La categoría no puede superar los 50 caracteres' })
  category?: string;

  @ApiPropertyOptional({ example: 0, minimum: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'El precio mínimo debe ser un número entero' })
  @Min(0, { message: 'El precio mínimo no puede ser negativo' })
  @Max(MAX_INT, { message: 'El precio mínimo es demasiado alto' })
  minPrice?: number;

  @ApiPropertyOptional({ example: 20000, minimum: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'El precio máximo debe ser un número entero' })
  @Min(0, { message: 'El precio máximo no puede ser negativo' })
  @Max(MAX_INT, { message: 'El precio máximo es demasiado alto' })
  maxPrice?: number;

  @ApiPropertyOptional({ enum: ProductCondition })
  @IsOptional()
  @IsEnum(ProductCondition, { message: 'La condición debe ser nuevo o usado' })
  condition?: ProductCondition;

  @ApiPropertyOptional({ enum: ProductSort, default: ProductSort.RECENT })
  @IsOptional()
  @IsEnum(ProductSort, { message: 'El orden debe ser recent, price_asc o price_desc' })
  sort: ProductSort = ProductSort.RECENT;

  @ApiPropertyOptional({ example: 1, default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'La página debe ser un número entero' })
  @Min(1, { message: 'La página debe ser mayor o igual a 1' })
  page: number = 1;

  @ApiPropertyOptional({ example: 12, default: 12, minimum: 1, maximum: 50 })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'El límite debe ser un número entero' })
  @Min(1, { message: 'El límite debe ser mayor o igual a 1' })
  @Max(50, { message: 'El límite no puede ser mayor a 50' })
  limit: number = 12;
}
