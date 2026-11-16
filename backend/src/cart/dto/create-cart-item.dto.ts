import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsPositive, Max, Min } from 'class-validator';

export class CreateCartItemDto {
  @ApiProperty({ example: 2 })
  @IsInt({ message: 'El ID del producto debe ser un número entero' })
  @IsPositive({ message: 'El producto es obligatorio' })
  productId: number;

  @ApiProperty({ example: 2, minimum: 1 })
  @IsInt({ message: 'La cantidad debe ser un número entero' })
  @Min(1, { message: 'La cantidad debe ser al menos 1' })
  @Max(2_147_483_647, { message: 'La cantidad es demasiado alta' })
  quantity: number;
}
