import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateMessageDto {
  @ApiProperty({
    description: 'Texto del mensaje (entre 1 y 1000 caracteres)',
    example: '¿Sigue disponible? ¿Entregas en campus Casona?',
    minLength: 1,
    maxLength: 1000,
  })
  @IsString({ message: 'El mensaje debe ser texto' })
  @IsNotEmpty({ message: 'El mensaje no puede estar vacío' })
  @MinLength(1, { message: 'El mensaje debe tener al menos 1 carácter' })
  @MaxLength(1000, { message: 'El mensaje no puede superar los 1000 caracteres' })
  text: string;
}
