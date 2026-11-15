import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ConversationDocument = HydratedDocument<Conversation>;

@Schema({ _id: false })
export class Message {
  @Prop({ required: true, type: Number })
  senderId: number;

  @Prop({ required: true, type: String, trim: true, minlength: 1, maxlength: 1000 })
  text: string;

  @Prop({ required: true, type: Date, default: () => new Date() })
  sentAt: Date;

  @Prop({ required: true, type: Boolean, default: false })
  read: boolean;
}

export const MessageSchema = SchemaFactory.createForClass(Message);

@Schema({
  collection: 'conversations',
  timestamps: { createdAt: 'createdAt', updatedAt: false },
  toJSON: {
    virtuals: true,
    versionKey: false,
    transform: (_doc, ret: Record<string, any>) => {
      ret.id = ret._id?.toString();
      delete ret._id;
      return ret;
    },
  },
})
export class Conversation {
  @Prop({ required: true, type: Number })
  productId: number;

  @Prop({ required: true, type: Number })
  buyerId: number;

  @Prop({ required: true, type: Number })
  sellerId: number;

  @Prop({ type: [MessageSchema], default: [] })
  messages: Message[];

  @Prop({ required: true, type: Date, default: () => new Date() })
  lastMessageAt: Date;

  createdAt: Date;
}

export const ConversationSchema = SchemaFactory.createForClass(Conversation);

// Índice compuesto único para evitar chats duplicados del mismo comprador por el mismo producto
ConversationSchema.index({ productId: 1, buyerId: 1 }, { unique: true });
ConversationSchema.index({ buyerId: 1, lastMessageAt: -1 });
ConversationSchema.index({ sellerId: 1, lastMessageAt: -1 });
