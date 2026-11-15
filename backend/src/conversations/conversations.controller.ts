import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Response } from 'express';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { ConversationsService } from './conversations.service';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { CreateMessageDto } from './dto/create-message.dto';

@ApiTags('conversations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
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
  async findMyConversations(@CurrentUser('sub') userId: number) {
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
    @CurrentUser('sub') userId: number,
    @Body() dto: CreateConversationDto,
    @Res({ passthrough: true }) res: Response,
  ) {
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
  async getMessages(
    @CurrentUser('sub') userId: number,
    @Param('id') id: string,
  ) {
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
    @CurrentUser('sub') userId: number,
    @Param('id') id: string,
    @Body() dto: CreateMessageDto,
  ) {
    return this.conversationsService.sendMessage(id, userId, dto.text);
  }
}
