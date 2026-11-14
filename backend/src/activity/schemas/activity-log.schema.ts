import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, SchemaTypes } from 'mongoose';

export type ActivityLogDocument = HydratedDocument<ActivityLog>;

export const ACTIVITY_TYPES = [
  'product_view',
  'search',
  'favorite_added',
  'order_created',
  'order_status_changed',
] as const;

export type ActivityType = (typeof ACTIVITY_TYPES)[number];

@Schema({
  collection: 'activity_logs',
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
export class ActivityLog {
  @Prop({ required: true, type: Number })
  userId: number;

  @Prop({ required: true, type: String, enum: ACTIVITY_TYPES })
  type: ActivityType;

  @Prop({ type: Number, default: null })
  productId: number | null;

  @Prop({ type: Number, default: null })
  orderId: number | null;

  @Prop({ type: SchemaTypes.Mixed, default: {} })
  meta: Record<string, any>;

  createdAt: Date;
}

export const ActivityLogSchema = SchemaFactory.createForClass(ActivityLog);

// Índices para optimizar GET /activity/me y GET /activity/me/recent-products
ActivityLogSchema.index({ userId: 1, createdAt: -1 });
ActivityLogSchema.index({ userId: 1, type: 1, createdAt: -1 });
