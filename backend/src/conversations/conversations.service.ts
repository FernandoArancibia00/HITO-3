import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';
import { DataSource } from 'typeorm';
import { Conversation, ConversationDocument } from './schemas/conversation.schema';

@Injectable()
export class ConversationsService {
  constructor(
    @InjectModel(Conversation.name)
    private readonly conversationModel: Model<ConversationDocument>,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * POST /api/conversations
   * Busca el producto en PostgreSQL para obtener el vendedor.
   * Si ya existe la conversación entre buyerId y productId, la devuelve.
   */
  async createOrGetConversation(buyerId: number, productId: number) {
    const product = await this.findProductInPostgres(productId);

    if (!product || product.isActive === false) {
      throw new NotFoundException('Producto no encontrado o inactivo');
    }

    const sellerId = Number(product.sellerId);

    if (sellerId === Number(buyerId)) {
      throw new BadRequestException(
        'No puedes abrir una conversación contigo mismo sobre tu propio producto',
      );
    }

    const existing = await this.conversationModel
      .findOne({ productId: Number(productId), buyerId: Number(buyerId) })
      .exec();

    if (existing) {
      return { conversation: existing.toJSON(), created: false };
    }

    const created = await this.conversationModel.create({
      productId: Number(productId),
      buyerId: Number(buyerId),
      sellerId,
      messages: [],
      lastMessageAt: new Date(),
    });

    return { conversation: created.toJSON(), created: true };
  }

  /**
   * GET /api/conversations
   * Lista las conversaciones del usuario (como comprador o vendedor) ordenadas por lastMessageAt.
   */
  async findUserConversations(userId: number) {
    const currentUserId = Number(userId);

    const conversations = await this.conversationModel
      .find({
        $or: [{ buyerId: currentUserId }, { sellerId: currentUserId }],
      })
      .sort({ lastMessageAt: -1 })
      .exec();

    if (conversations.length === 0) {
      return [];
    }

    const productIds = Array.from(new Set(conversations.map((c) => c.productId)));
    const otherUserIds = Array.from(
      new Set(
        conversations.map((c) =>
          c.buyerId === currentUserId ? c.sellerId : c.buyerId,
        ),
      ),
    );

    const [productsMap, usersMap] = await Promise.all([
      this.findProductsMap(productIds),
      this.findUsersMap(otherUserIds),
    ]);

    return conversations.map((conv) => {
      const otherUserId =
        conv.buyerId === currentUserId ? conv.sellerId : conv.buyerId;
      const lastMsg =
        conv.messages.length > 0
          ? conv.messages[conv.messages.length - 1]
          : null;

      const unreadCount = conv.messages.filter(
        (m) => m.senderId !== currentUserId && !m.read,
      ).length;

      const productData = productsMap.get(conv.productId) || {
        id: conv.productId,
        title: `Producto #${conv.productId}`,
        imageUrl: null,
      };

      const otherUserData = usersMap.get(otherUserId) || {
        id: otherUserId,
        name: `Usuario #${otherUserId}`,
      };

      return {
        id: conv._id.toString(),
        product: {
          id: Number(productData.id),
          title: productData.title,
          imageUrl: productData.imageUrl ?? null,
        },
        otherUser: {
          id: Number(otherUserData.id),
          name: otherUserData.name,
        },
        lastMessage: lastMsg ? lastMsg.text : null,
        lastMessageAt: conv.lastMessageAt,
        unreadCount,
      };
    });
  }

  /**
   * GET /api/conversations/:id/messages
   * Obtiene los mensajes de una conversación y marca como leídos los recibidos.
   */
  async getMessages(conversationId: string, userId: number) {
    const conv = await this.findAndAuthorize(conversationId, userId);
    const currentUserId = Number(userId);

    let hasUnread = false;
    for (const msg of conv.messages) {
      if (msg.senderId !== currentUserId && !msg.read) {
        msg.read = true;
        hasUnread = true;
      }
    }

    if (hasUnread) {
      conv.markModified('messages');
      await conv.save();
    }

    return {
      id: conv._id.toString(),
      productId: conv.productId,
      buyerId: conv.buyerId,
      sellerId: conv.sellerId,
      messages: conv.messages,
    };
  }

  /**
   * POST /api/conversations/:id/messages
   * Agrega un nuevo mensaje a la conversación y actualiza lastMessageAt.
   */
  async sendMessage(conversationId: string, senderId: number, text: string) {
    const conv = await this.findAndAuthorize(conversationId, senderId);
    const now = new Date();

    const newMessage = {
      senderId: Number(senderId),
      text: text.trim(),
      sentAt: now,
      read: false,
    };

    conv.messages.push(newMessage);
    conv.lastMessageAt = now;
    await conv.save();

    return newMessage;
  }

  private async findAndAuthorize(
    conversationId: string,
    userId: number,
  ): Promise<ConversationDocument> {
    if (!isValidObjectId(conversationId)) {
      throw new NotFoundException('Conversación no encontrada');
    }

    const conv = await this.conversationModel.findById(conversationId).exec();
    if (!conv) {
      throw new NotFoundException('Conversación no encontrada');
    }

    const currentUserId = Number(userId);
    if (conv.buyerId !== currentUserId && conv.sellerId !== currentUserId) {
      throw new ForbiddenException(
        'No tienes permiso para acceder a esta conversación',
      );
    }

    return conv;
  }

  private async findProductInPostgres(productId: number): Promise<{
    id: number;
    title: string;
    imageUrl: string | null;
    sellerId: number;
    isActive: boolean;
  } | null> {
    try {
      const rows = await this.dataSource.query(
        `SELECT id, title,
                COALESCE("imageUrl", image_url) AS "imageUrl",
                COALESCE("sellerId", seller_id) AS "sellerId",
                COALESCE("isActive", is_active, true) AS "isActive"
         FROM products
         WHERE id = $1
         LIMIT 1`,
        [productId],
      );
      return rows[0] || null;
    } catch {
      try {
        const rows = await this.dataSource.query(
          `SELECT id, title, "imageUrl", "sellerId", "isActive"
           FROM products
           WHERE id = $1
           LIMIT 1`,
          [productId],
        );
        return rows[0] || null;
      } catch {
        return null;
      }
    }
  }

  private async findProductsMap(productIds: number[]) {
    const map = new Map<number, { id: number; title: string; imageUrl: string | null }>();
    if (productIds.length === 0) return map;

    try {
      const rows = await this.dataSource.query(
        `SELECT id, title, "imageUrl" FROM products WHERE id = ANY($1::int[])`,
        [productIds],
      );
      for (const r of rows) {
        map.set(Number(r.id), r);
      }
    } catch {
      try {
        const rows = await this.dataSource.query(
          `SELECT id, title, image_url AS "imageUrl" FROM products WHERE id = ANY($1::int[])`,
          [productIds],
        );
        for (const r of rows) {
          map.set(Number(r.id), r);
        }
      } catch {
        // Si la tabla products aún no está migrada, retorna el mapa vacío y usa fallback seguro
      }
    }
    return map;
  }

  private async findUsersMap(userIds: number[]) {
    const map = new Map<number, { id: number; name: string }>();
    if (userIds.length === 0) return map;

    try {
      const rows = await this.dataSource.query(
        `SELECT id, name FROM users WHERE id = ANY($1::int[])`,
        [userIds],
      );
      for (const r of rows) {
        map.set(Number(r.id), r);
      }
    } catch {
      // Si la tabla users aún no está migrada, retorna el mapa vacío y usa fallback seguro
    }
    return map;
  }
}
