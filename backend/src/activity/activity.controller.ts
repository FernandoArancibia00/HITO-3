import {
  Controller,
  Get,
  Query,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Request } from 'express';
import { ActivityService } from './activity.service';
import { ActivityQueryDto } from './dto/activity-query.dto';

@ApiTags('activity')
@ApiBearerAuth()
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
  async getMyRecentProducts(@Req() req: Request) {
    const userId = this.extractUserId(req);
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
  async getMyActivity(@Req() req: Request, @Query() query: ActivityQueryDto) {
    const userId = this.extractUserId(req);
    return this.activityService.getMyActivity(userId, query);
  }

  private extractUserId(req: Request): number {
    const anyReq = req as any;
    if (anyReq.user) {
      const idFromUser = anyReq.user.sub ?? anyReq.user.id ?? anyReq.user.userId;
      if (idFromUser !== undefined && !Number.isNaN(Number(idFromUser))) {
        return Number(idFromUser);
      }
    }

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.slice(7).trim();
      try {
        const parts = token.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(
            Buffer.from(parts[1], 'base64url').toString('utf8'),
          );
          const idFromToken = payload.sub ?? payload.id ?? payload.userId;
          if (idFromToken !== undefined && !Number.isNaN(Number(idFromToken))) {
            return Number(idFromToken);
          }
        }
      } catch {
        throw new UnauthorizedException('Token inválido o expirado');
      }
    }

    const headerUserId = req.headers['x-user-id'];
    if (headerUserId && !Number.isNaN(Number(headerUserId))) {
      return Number(headerUserId);
    }

    throw new UnauthorizedException(
      'Debe iniciar sesión para consultar su actividad',
    );
  }
}
