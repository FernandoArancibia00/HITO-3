import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { ActivityService } from './activity.service';
import { ActivityQueryDto } from './dto/activity-query.dto';

@ApiTags('activity')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('activity')
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  @Get('me/recent-products')
  @ApiOperation({
    summary: 'Obtener los últimos 10 productos vistos por el usuario conectado (sin repetir)',
  })
  @ApiResponse({
    status: 200,
    description: 'Arreglo de hasta 10 productos vistos recientemente',
  })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  async getMyRecentProducts(@CurrentUser('sub') userId: number) {
    return this.activityService.getRecentProducts(userId);
  }

  @Get('me')
  @ApiOperation({
    summary: 'Obtener el historial de actividad del usuario conectado',
  })
  @ApiResponse({
    status: 200,
    description: 'Arreglo de registros activity_logs del usuario',
  })
  @ApiResponse({ status: 400, description: 'Parámetros de filtro inválidos' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  async getMyActivity(
    @CurrentUser('sub') userId: number,
    @Query() query: ActivityQueryDto,
  ) {
    return this.activityService.getMyActivity(userId, query);
  }
}
