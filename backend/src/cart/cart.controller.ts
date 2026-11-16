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
import { CreateCartItemDto } from './dto/create-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { CartResponse, CartService } from './cart.service';

@ApiTags('cart')
@Controller('cart')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener el carrito del usuario autenticado' })
  @ApiResponse({
    status: 200,
    description: 'Carrito con sus ítems y el total calculado en el backend',
  })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  findAll(@CurrentUser('sub') userId: number): Promise<CartResponse> {
    return this.cartService.findAll(userId);
  }

  @Post()
  @ApiOperation({ summary: 'Agregar un producto al carrito' })
  @ApiResponse({ status: 201, description: 'Carrito actualizado' })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos, stock insuficiente o producto propio',
  })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({
    status: 404,
    description: 'El producto no existe o está inactivo',
  })
  add(
    @Body() dto: CreateCartItemDto,
    @CurrentUser('sub') userId: number,
  ): Promise<CartResponse> {
    return this.cartService.add(userId, dto);
  }

  @Patch(':itemId')
  @ApiOperation({ summary: 'Actualizar la cantidad de un ítem del carrito' })
  @ApiParam({ name: 'itemId', description: 'ID entero del ítem del carrito' })
  @ApiResponse({ status: 200, description: 'Carrito actualizado' })
  @ApiResponse({ status: 400, description: 'Cantidad inválida o stock insuficiente' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({
    status: 404,
    description: 'El ítem no existe en el carrito del usuario',
  })
  update(
    @Param('itemId', ParseIntPipe) itemId: number,
    @Body() dto: UpdateCartItemDto,
    @CurrentUser('sub') userId: number,
  ): Promise<CartResponse> {
    return this.cartService.update(userId, itemId, dto);
  }

  @Delete(':itemId')
  @ApiOperation({ summary: 'Eliminar un ítem del carrito' })
  @ApiParam({ name: 'itemId', description: 'ID entero del ítem del carrito' })
  @ApiResponse({ status: 200, description: 'Carrito actualizado sin el ítem' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({
    status: 404,
    description: 'El ítem no existe en el carrito del usuario',
  })
  remove(
    @Param('itemId', ParseIntPipe) itemId: number,
    @CurrentUser('sub') userId: number,
  ): Promise<CartResponse> {
    return this.cartService.remove(userId, itemId);
  }

  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Vaciar el carrito del usuario autenticado' })
  @ApiResponse({ status: 204, description: 'Carrito vaciado sin cuerpo' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  clear(@CurrentUser('sub') userId: number): Promise<void> {
    return this.cartService.clear(userId);
  }
}
