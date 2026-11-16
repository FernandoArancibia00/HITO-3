
import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { join } from 'node:path';
import { existsSync } from 'node:fs';

import { User } from '../users/entities/user.entity';
import { Category } from '../categories/entities/category.entity';
import { Product } from '../products/entities/product.entity';
import { Favorite } from '../favorites/entities/favorite.entity';
import { CartItem } from '../cart/entities/cart-item.entity';
import { Order } from '../orders/entities/order.entity';
import { OrderItem } from '../orders/entities/order-item.entity';
import { Transaction } from '../orders/entities/transaction.entity';

// Cargar las variables locales cuando se ejecuta TypeORM desde la terminal.
const envPath = join(__dirname, '../../.env');

if (existsSync(envPath)) {
  process.loadEnvFile(envPath);
}

export default new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [
    User,
    Category,
    Product,
    Favorite,
    CartItem,
    Order,
    OrderItem,
    Transaction,
  ],
  migrations: [join(__dirname, 'migrations/*{.js,.ts}')],
  synchronize: false,
});
