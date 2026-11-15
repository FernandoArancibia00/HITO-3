import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoriesModule } from '../categories/categories.module';
import { UsersModule } from '../users/users.module';
import { Product } from './entities/product.entity';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';

// ActivityService no se importa aquí: ActivityModule es @Global().
// Exporta TypeOrmModule para que carrito, favoritos y pedidos inyecten Repository<Product>.
@Module({
  imports: [TypeOrmModule.forFeature([Product]), CategoriesModule, UsersModule],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [TypeOrmModule],
})
export class ProductsModule {}
