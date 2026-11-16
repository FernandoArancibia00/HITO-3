import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ActivityService } from '../activity/activity.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../common/guards/optional-jwt-auth.guard';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductQueryDto } from './dto/product-query.dto';
import {
  PaginatedProductsDto,
  ProductResponseDto,
} from './dto/product-response.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';
import { PaginatedProducts, ProductsService } from './products.service';

// Orden de las rutas: 'mine' se declara antes de ':id' para que no se lea como un id
@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
    private readonly activityService: ActivityService,
  ) {}

  @Get()
  @UseGuards(OptionalJwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Catálogo con búsqueda, filtros, orden y paginación (público; token opcional)',
    description:
      'Solo productos activos y con stock. Si se envía token, la búsqueda queda en el historial de actividad.',
  })
  @ApiResponse({ status: 200, description: 'Página de productos', type: PaginatedProductsDto })
  @ApiResponse({
    status: 400,
    description: 'Parámetros inválidos o minPrice mayor que maxPrice',
  })
  async findAll(
    @Query() query: ProductQueryDto,
    @CurrentUser('sub') userId?: number,
  ): Promise<PaginatedProducts> {
    const result = await this.productsService.findAll(query);

    // Solo en la página 1, para que "Cargar más" no repita la búsqueda en el historial.
    // Sin await: log() nunca lanza errores y así no retrasa la respuesta
    const term = query.search?.trim();
    if (userId && term && query.page === 1) {
      void this.activityService.log({ userId, type: 'search', meta: { search: term } });
    }

    return result;
  }

  @Get('mine')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mis publicaciones (incluye inactivas y sin stock)' })
  @ApiResponse({ status: 200, description: 'Productos del usuario', type: [ProductResponseDto] })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  findMine(@CurrentUser('sub') userId: number): Promise<Product[]> {
    return this.productsService.findMine(userId);
  }

  @Get(':id')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Detalle de un producto (público; token opcional)',
    description: 'Si se envía token, la visita queda en el historial (vistos recientemente).',
  })
  @ApiParam({ name: 'id', description: 'ID del producto' })
  @ApiResponse({ status: 200, description: 'Producto con seller y category', type: ProductResponseDto })
  @ApiResponse({ status: 400, description: 'id no numérico' })
  @ApiResponse({ status: 404, description: 'El producto no existe' })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('sub') userId?: number,
  ): Promise<Product> {
    const product = await this.productsService.findOne(id);

    if (userId) {
      void this.activityService.log({ userId, type: 'product_view', productId: id });
    }

    return product;
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Publicar un producto (el vendedor sale del token; un buyer pasa a seller)',
  })
  @ApiResponse({ status: 201, description: 'Producto creado', type: ProductResponseDto })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 404, description: 'La categoría no existe' })
  create(
    @Body() dto: CreateProductDto,
    @CurrentUser('sub') userId: number,
  ): Promise<Product> {
    return this.productsService.create(dto, userId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Editar un producto (solo el dueño)' })
  @ApiParam({ name: 'id', description: 'ID del producto' })
  @ApiResponse({ status: 200, description: 'Producto actualizado', type: ProductResponseDto })
  @ApiResponse({ status: 400, description: 'Datos inválidos o id no numérico' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'El producto no es del usuario' })
  @ApiResponse({ status: 404, description: 'El producto o la categoría no existen' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateProductDto,
    @CurrentUser('sub') userId: number,
  ): Promise<Product> {
    return this.productsService.update(id, dto, userId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Desactivar un producto (borrado lógico, solo el dueño)' })
  @ApiParam({ name: 'id', description: 'ID del producto' })
  @ApiResponse({ status: 204, description: 'Producto desactivado (isActive = false)' })
  @ApiResponse({ status: 400, description: 'id no numérico' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'El producto no es del usuario' })
  @ApiResponse({ status: 404, description: 'El producto no existe' })
  remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('sub') userId: number,
  ): Promise<void> {
    return this.productsService.remove(id, userId);
  }
}
