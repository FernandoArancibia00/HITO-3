import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches, MaxLength } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({
    example: 'ropa',
    description: 'Identificador en minúsculas, números y guiones (no se puede cambiar después)',
  })
  @IsString({ message: 'El slug debe ser texto' })
  @IsNotEmpty({ message: 'El slug es obligatorio' })
  @MaxLength(50, { message: 'El slug no puede superar los 50 caracteres' })
  @Matches(/^[a-z0-9]+(-[a-z0-9]+)*$/, {
    message: 'El slug solo puede tener minúsculas, números y guiones (ej. utiles-oficina)',
  })
  slug: string;

  @ApiProperty({ example: 'Ropa y Accesorios' })
  @IsString({ message: 'El nombre debe ser texto' })
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @MaxLength(100, { message: 'El nombre no puede superar los 100 caracteres' })
  name: string;

  @ApiProperty({ example: 'bag', description: 'Nombre de un ícono de Bootstrap Icons' })
  @IsString({ message: 'El ícono debe ser texto' })
  @IsNotEmpty({ message: 'El ícono es obligatorio' })
  @MaxLength(50, { message: 'El ícono no puede superar los 50 caracteres' })
  icon: string;
}
