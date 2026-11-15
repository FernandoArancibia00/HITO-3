import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';

// Por ahora solo registra la entidad (T12). Controlador y servicio llegan en T13.
// Exporta TypeOrmModule para que carrito, favoritos y pedidos inyecten Repository<Product>.
@Module({
  imports: [TypeOrmModule.forFeature([Product])],
  exports: [TypeOrmModule],
})
export class ProductsModule {}
