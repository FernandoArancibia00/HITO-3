import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Max, Min } from 'class-validator';

export class UpdateCartItemDto {
  @ApiProperty({ example: 1, minimum: 1 })
  @IsInt({ message: 'La cantidad debe ser un número entero' })
  @Min(1, { message: 'La cantidad debe ser al menos 1' })
  @Max(2_147_483_647, { message: 'La cantidad es demasiado alta' })
  quantity: number;
}
