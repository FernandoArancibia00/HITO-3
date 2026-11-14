import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DataSource } from 'typeorm';
import { ActivityQueryDto } from './dto/activity-query.dto';
import {
  ActivityLog,
  ActivityLogDocument,
  ActivityType,
} from './schemas/activity-log.schema';

export interface LogActivityInput {
  userId: number;
  type: ActivityType;
  productId?: number | null;
  orderId?: number | null;
  meta?: Record<string, any>;
}

@Injectable()
export class ActivityService {
  private readonly logger = new Logger(ActivityService.name);

  constructor(
    @InjectModel(ActivityLog.name)
    private readonly activityLogModel: Model<ActivityLogDocument>,
    private readonly dataSource: DataSource,
  ) {}

  async log(input: LogActivityInput): Promise<ActivityLog | null> {
    try {
      const created = await this.activityLogModel.create({
        userId: Number(input.userId),
        type: input.type,
        productId:
          input.productId !== undefined && input.productId !== null
            ? Number(input.productId)
            : null,
        orderId:
          input.orderId !== undefined && input.orderId !== null
            ? Number(input.orderId)
            : null,
        meta: input.meta ?? {},
      });
      return created.toJSON();
    } catch (error) {
      this.logger.error(
        `No se pudo registrar activity_log (${input.type}) para userId=${input.userId}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
      return null;
    }
  }

  async getMyActivity(userId: number, query: ActivityQueryDto = {}) {
    const filter: Record<string, any> = { userId: Number(userId) };
    if (query.type) {
      filter.type = query.type;
    }

    const limit = query.limit ? Math.min(Math.max(Number(query.limit), 1), 100) : 20;

    const docs = await this.activityLogModel
      .find(filter)
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();

    return docs.map((doc) => doc.toJSON());
  }

  async getRecentProducts(userId: number) {
    const recentViews = await this.activityLogModel
      .find({
        userId: Number(userId),
        type: 'product_view',
        productId: { $ne: null },
      })
      .sort({ createdAt: -1 })
      .limit(100)
      .exec();

    const uniqueProductIds: number[] = [];
    const seen = new Set<number>();

    for (const view of recentViews) {
      const pid = Number(view.productId);
      if (pid && !seen.has(pid)) {
        seen.add(pid);
        uniqueProductIds.push(pid);
        if (uniqueProductIds.length === 10) {
          break;
        }
      }
    }

    if (uniqueProductIds.length === 0) {
      return [];
    }

    const productsById = await this.fetchProductsFromPostgres(uniqueProductIds);

    return uniqueProductIds
      .map((id) => productsById.get(id))
      .filter((product) => Boolean(product));
  }

  private async fetchProductsFromPostgres(productIds: number[]) {
    const map = new Map<number, any>();
    if (productIds.length === 0) return map;

    try {
      const rows = await this.dataSource.query(
        `SELECT
           p.id,
           p.title,
           p.description,
           p.price,
           p.stock,
           p.condition,
           COALESCE(p."imageUrl", p.image_url) AS "imageUrl",
           COALESCE(p."isActive", p.is_active, true) AS "isActive",
           COALESCE(p."sellerId", p.seller_id) AS "sellerId",
           COALESCE(p."categoryId", p.category_id) AS "categoryId",
           COALESCE(p."createdAt", p.created_at) AS "createdAt",
           COALESCE(p."updatedAt", p.updated_at) AS "updatedAt",
           u.id AS "seller_id",
           u.name AS "seller_name",
           u.career AS "seller_career",
           u.campus AS "seller_campus",
           c.id AS "category_id",
           c.slug AS "category_slug",
           c.name AS "category_name",
           c.icon AS "category_icon"
         FROM products p
         LEFT JOIN users u ON u.id = COALESCE(p."sellerId", p.seller_id)
         LEFT JOIN categories c ON c.id = COALESCE(p."categoryId", p.category_id)
         WHERE p.id = ANY($1::int[])`,
        [productIds],
      );

      for (const r of rows) {
        map.set(Number(r.id), {
          id: Number(r.id),
          title: r.title,
          description: r.description,
          price: Number(r.price),
          stock: Number(r.stock),
          condition: r.condition,
          imageUrl: r.imageUrl ?? null,
          isActive: Boolean(r.isActive),
          sellerId: Number(r.sellerId),
          categoryId: Number(r.categoryId),
          createdAt: r.createdAt,
          updatedAt: r.updatedAt,
          seller: r.seller_id
            ? {
                id: Number(r.seller_id),
                name: r.seller_name,
                career: r.seller_career,
                campus: r.seller_campus,
              }
            : undefined,
          category: r.category_id
            ? {
                id: Number(r.category_id),
                slug: r.category_slug,
                name: r.category_name,
                icon: r.category_icon,
              }
            : undefined,
        });
      }
    } catch {
      try {
        const rows = await this.dataSource.query(
          `SELECT * FROM products WHERE id = ANY($1::int[])`,
          [productIds],
        );
        for (const r of rows) {
          map.set(Number(r.id), r);
        }
      } catch {
        // Si las tablas SQL aún no están migradas, retorna mapa vacío
      }
    }

    return map;
  }
}
