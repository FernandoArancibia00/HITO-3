import {
  Body,
  Controller,
  Get,
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
import { PayOrderDto } from './dto/pay-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import {
  OrderDetailResponse,
  PaymentResponse,
  OrderResponse,
  OrdersService,
} from './orders.service';

@ApiTags('orders')
@Controller('orders')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un pedido desde el carrito del comprador' })
  @ApiResponse({ status: 201, description: 'Pedido creado con sus ítems' })
  @ApiResponse({ status: 400, description: 'El carrito está vacío' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({
    status: 409,
    description: 'Stock insuficiente al momento de comprar',
  })
  create(
    @CurrentUser('sub') buyerId: number,
  ): Promise<OrderResponse> {
    return this.ordersService.createFromCart(buyerId);
  }

  @Get()
  @ApiOperation({ summary: 'Consultar las compras del usuario autenticado' })
  @ApiResponse({ status: 200, description: 'Compras con sus ítems' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  findAll(
    @CurrentUser('sub') buyerId: number,
  ): Promise<OrderResponse[]> {
    return this.ordersService.findAll(buyerId);
  }

  @Get('sales')
  @ApiOperation({ summary: 'Consultar las ventas del usuario autenticado' })
  @ApiResponse({
    status: 200,
    description: 'Pedidos con solo los ítems vendidos por el usuario',
  })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  findSales(
    @CurrentUser('sub') sellerId: number,
  ): Promise<OrderResponse[]> {
    return this.ordersService.findSales(sellerId);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Actualizar el estado de un pedido' })
  @ApiParam({ name: 'id', description: 'ID entero del pedido' })
  @ApiResponse({ status: 200, description: 'Pedido actualizado con sus ítems' })
  @ApiResponse({ status: 400, description: 'Estado inválido o id no numérico' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({
    status: 403,
    description: 'El usuario no participa o no puede hacer este cambio',
  })
  @ApiResponse({ status: 404, description: 'El pedido no existe' })
  @ApiResponse({ status: 409, description: 'Transición no válida' })
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateOrderStatusDto,
    @CurrentUser('sub') userId: number,
  ): Promise<OrderResponse> {
    return this.ordersService.updateStatus(id, userId, dto.status);
  }

  @Post(':id/pay')
  @ApiOperation({ summary: 'Procesar el pago simulado de un pedido' })
  @ApiParam({ name: 'id', description: 'ID entero del pedido' })
  @ApiResponse({
    status: 201,
    description: 'Transacción registrada y pedido actualizado si se aprobó',
  })
  @ApiResponse({ status: 400, description: 'Número de tarjeta inválido' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'El usuario no es el comprador' })
  @ApiResponse({ status: 404, description: 'El pedido no existe' })
  @ApiResponse({
    status: 409,
    description: 'El pedido no está pendiente',
  })
  pay(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: PayOrderDto,
    @CurrentUser('sub') buyerId: number,
  ): Promise<PaymentResponse> {
    return this.ordersService.pay(id, buyerId, dto.cardNumber);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Consultar el detalle de un pedido participante' })
  @ApiParam({ name: 'id', description: 'ID entero del pedido' })
  @ApiResponse({
    status: 200,
    description: 'Pedido con ítems y datos públicos del comprador',
  })
  @ApiResponse({ status: 400, description: 'id no numérico' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'El usuario no participa en el pedido' })
  @ApiResponse({ status: 404, description: 'El pedido no existe' })
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('sub') userId: number,
  ): Promise<OrderDetailResponse> {
    return this.ordersService.findOne(id, userId);
  }
}
