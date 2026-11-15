import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Request, Response } from 'express';
import { ConversationsService } from './conversations.service';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { CreateMessageDto } from './dto/create-message.dto';

@ApiTags('conversations')
@ApiBearerAuth()
@Controller('conversations')
export class ConversationsController {
  constructor(private readonly conversationsService: ConversationsService) {}

  @Get()
  @ApiOperation({
    summary: 'Listar mis conversaciones (como comprador o vendedor)',
  })
  @ApiResponse({
    status: 200,
    description:
      'Lista de conversaciones ordenadas por último mensaje con unreadCount',
  })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  async findMyConversations(@Req() req: Request) {
    const userId = this.extractUserId(req);
    return this.conversationsService.findUserConversations(userId);
  }

  @Post()
  @ApiOperation({
    summary: 'Crear o recuperar una conversación sobre un producto',
  })
  @ApiResponse({ status: 201, description: 'Conversación creada' })
  @ApiResponse({ status: 200, description: 'Conversación existente recuperada' })
  @ApiResponse({
    status: 400,
    description: 'No se puede abrir un chat con uno mismo o datos inválidos',
  })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 404, description: 'Producto no encontrado' })
  async createConversation(
    @Req() req: Request,
    @Body() dto: CreateConversationDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const userId = this.extractUserId(req);
    const { conversation, created } =
      await this.conversationsService.createOrGetConversation(
        userId,
        dto.productId,
      );

    res.status(created ? 201 : 200);
    return conversation;
  }

  @Get(':id/messages')
  @ApiOperation({
    summary:
      'Obtener los mensajes de una conversación (marca como leídos los recibidos)',
  })
  @ApiParam({ name: 'id', description: 'ID de la conversación (Mongo ObjectId)' })
  @ApiResponse({
    status: 200,
    description: 'Detalle de la conversación con todos sus mensajes',
  })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({
    status: 403,
    description: 'No eres participante de esta conversación',
  })
  @ApiResponse({ status: 404, description: 'Conversación no encontrada' })
  async getMessages(@Req() req: Request, @Param('id') id: string) {
    const userId = this.extractUserId(req);
    return this.conversationsService.getMessages(id, userId);
  }

  @Post(':id/messages')
  @ApiOperation({ summary: 'Enviar un mensaje en una conversación' })
  @ApiParam({ name: 'id', description: 'ID de la conversación (Mongo ObjectId)' })
  @ApiResponse({ status: 201, description: 'Mensaje creado' })
  @ApiResponse({ status: 400, description: 'Texto inválido (1 a 1000 caracteres)' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({
    status: 403,
    description: 'No eres participante de esta conversación',
  })
  @ApiResponse({ status: 404, description: 'Conversación no encontrada' })
  async sendMessage(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() dto: CreateMessageDto,
  ) {
    const userId = this.extractUserId(req);
    return this.conversationsService.sendMessage(id, userId, dto.text);
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

    throw new UnauthorizedException('Debe iniciar sesión para acceder a las conversaciones');
  }
}
