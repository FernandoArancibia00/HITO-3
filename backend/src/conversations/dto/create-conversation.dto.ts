import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsPositive } from 'class-validator';

export class CreateConversationDto {
  @ApiProperty({
    description: 'ID del producto en PostgreSQL sobre el cual se inicia la conversación',
    example: 12,
  })
  @IsInt({ message: 'El productId debe ser un número entero' })
  @IsPositive({ message: 'El productId debe ser mayor a 0' })
  productId: number;
}
