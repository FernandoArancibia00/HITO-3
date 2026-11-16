import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches } from 'class-validator';

export class PayOrderDto {
  @ApiProperty({
    example: '4500123456789012',
    minLength: 16,
    maxLength: 16,
    pattern: '^\\d{16}$',
  })
  @IsString({ message: 'El número de tarjeta debe ser texto' })
  @Matches(/^\d{16}$/, {
    message: 'El número de tarjeta debe tener exactamente 16 dígitos',
  })
  cardNumber: string;
}
