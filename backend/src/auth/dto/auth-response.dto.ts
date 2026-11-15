import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../users/entities/user.entity';

// Solo documenta en Swagger la forma de la respuesta de registro y login
export class AuthUserDto {
  @ApiProperty({ example: 9 })
  id: number;

  @ApiProperty({ example: 'Camila Rojas' })
  name: string;

  @ApiProperty({ example: 'camila.rojas@unab.cl' })
  email: string;

  @ApiProperty({ enum: UserRole, example: UserRole.BUYER })
  role: UserRole;

  @ApiProperty({ example: 'Ingeniería Comercial', nullable: true })
  career: string | null;

  @ApiProperty({ example: 'Casona', nullable: true })
  campus: string | null;
}

export class AuthResponseDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  accessToken: string;

  @ApiProperty({ type: AuthUserDto })
  user: AuthUserDto;
}
