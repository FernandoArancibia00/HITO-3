import { ApiProperty, OmitType } from '@nestjs/swagger';
import { Category } from '../../categories/entities/category.entity';
import { Product } from '../entities/product.entity';

// Estas clases solo documentan en Swagger la forma de las respuestas

export class ProductSellerDto {
  @ApiProperty({ example: 3 })
  id: number;

  @ApiProperty({ example: 'María González' })
  name: string;

  @ApiProperty({ example: 'Arquitectura', nullable: true })
  career: string | null;

  @ApiProperty({ example: 'Los Leones', nullable: true })
  campus: string | null;
}

// Product con seller público (sin correo, teléfono ni rol) y category
export class ProductResponseDto extends OmitType(Product, ['seller', 'category'] as const) {
  @ApiProperty({ type: ProductSellerDto })
  seller: ProductSellerDto;

  @ApiProperty({ type: Category })
  category: Category;
}

export class PaginatedProductsDto {
  @ApiProperty({ type: [ProductResponseDto] })
  data: ProductResponseDto[];

  @ApiProperty({ example: 42 })
  total: number;

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 12 })
  limit: number;
}
