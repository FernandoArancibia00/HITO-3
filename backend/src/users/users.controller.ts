import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { UpdateUserDto } from './dto/update-user.dto';
import { PublicProfileDto, UserResponseDto } from './dto/user-response.dto';
import { User } from './entities/user.entity';
import { PublicProfile, UsersService } from './users.service';

// Orden de las rutas: 'me' se declara antes de ':id' para que no se lea como un id
@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Perfil del usuario conectado' })
  @ApiResponse({ status: 200, description: 'Datos del usuario', type: UserResponseDto })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 404, description: 'El usuario del token ya no existe' })
  getMe(@CurrentUser('sub') userId: number): Promise<User> {
    return this.usersService.findMe(userId);
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Editar mi perfil (nombre, carrera, campus y teléfono)',
    description:
      'email y role no se pueden modificar: enviarlos responde 400. Un texto vacío en career, campus o phone borra el dato.',
  })
  @ApiResponse({ status: 200, description: 'Usuario actualizado', type: UserResponseDto })
  @ApiResponse({ status: 400, description: 'Datos inválidos o campos no permitidos' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  updateMe(
    @CurrentUser('sub') userId: number,
    @Body() dto: UpdateUserDto,
  ): Promise<User> {
    return this.usersService.updateMe(userId, dto);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Perfil público de un usuario con sus productos activos y con stock',
    description: 'No incluye correo, teléfono ni rol.',
  })
  @ApiParam({ name: 'id', description: 'ID del usuario' })
  @ApiResponse({ status: 200, description: 'Perfil público', type: PublicProfileDto })
  @ApiResponse({ status: 400, description: 'id no numérico' })
  @ApiResponse({ status: 404, description: 'El usuario no existe' })
  getPublicProfile(@Param('id', ParseIntPipe) id: number): Promise<PublicProfile> {
    return this.usersService.findPublicProfile(id);
  }
}
