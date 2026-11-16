import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
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
import { ProductResponseDto } from '../products/dto/product-response.dto';
import { Product } from '../products/entities/product.entity';
import { FavoritesService } from './favorites.service';

@ApiTags('favorites')
@Controller('favorites')
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Listar los productos favoritos del usuario' })
  @ApiResponse({
    status: 200,
    description: 'Productos favoritos del usuario autenticado',
    type: [ProductResponseDto],
  })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  findAll(@CurrentUser('sub') userId: number): Promise<Product[]> {
    return this.favoritesService.findAll(userId);
  }

  @Post(':productId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Agregar un producto a favoritos' })
  @ApiParam({ name: 'productId', description: 'ID entero del producto' })
  @ApiResponse({ status: 201, description: 'Producto agregado sin cuerpo' })
  @ApiResponse({ status: 400, description: 'productId no es un entero' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({
    status: 404,
    description: 'El producto no existe o está inactivo',
  })
  @ApiResponse({ status: 409, description: 'El producto ya está en favoritos' })
  add(
    @Param('productId', ParseIntPipe) productId: number,
    @CurrentUser('sub') userId: number,
  ): Promise<void> {
    return this.favoritesService.add(userId, productId);
  }

  @Delete(':productId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Quitar un producto de favoritos' })
  @ApiParam({ name: 'productId', description: 'ID entero del producto' })
  @ApiResponse({ status: 204, description: 'Producto quitado sin cuerpo' })
  @ApiResponse({ status: 400, description: 'productId no es un entero' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({
    status: 404,
    description: 'El producto no está en los favoritos del usuario',
  })
  remove(
    @Param('productId', ParseIntPipe) productId: number,
    @CurrentUser('sub') userId: number,
  ): Promise<void> {
    return this.favoritesService.remove(userId, productId);
  }
}
