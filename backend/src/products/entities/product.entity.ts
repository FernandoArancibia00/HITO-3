import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Category } from '../../categories/entities/category.entity';
import { User } from '../../users/entities/user.entity';

export enum ProductCondition {
  NUEVO = 'nuevo',
  USADO = 'usado',
}

// Restricciones también en la base, no solo en los DTO
@Check('CHK_products_price_positive', '"price" > 0')
@Check('CHK_products_stock_non_negative', '"stock" >= 0')
@Entity('products')
export class Product {
  @ApiProperty({ example: 2 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 'Calculadora Científica Casio FX-991' })
  @Column({ type: 'varchar', length: 150 })
  title: string;

  @ApiProperty({ example: 'Casi nueva, la vendo porque me regalaron otra.' })
  @Column({ type: 'text' })
  description: string;

  // Pesos chilenos como entero, sin decimales
  @ApiProperty({ example: 15000, description: 'Precio en CLP (entero > 0)' })
  @Column({ type: 'int' })
  price: number;

  @ApiProperty({ example: 1, default: 1 })
  @Column({ type: 'int', default: 1 })
  stock: number;

  @ApiProperty({ enum: ProductCondition, example: ProductCondition.USADO })
  @Column({ type: 'enum', enum: ProductCondition })
  condition: ProductCondition;

  @ApiPropertyOptional({ example: 'https://ejemplo.cl/imagen.webp', nullable: true })
  @Column({ type: 'varchar', length: 500, nullable: true })
  imageUrl: string | null;

  // Borrado lógico: DELETE /products/:id deja isActive = false
  @ApiProperty({ example: true, default: true })
  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  // La columna FK se expone como campo propio para poder leerla y filtrar sin cargar la relación
  @ApiProperty({ example: 3 })
  @Column({ type: 'int' })
  sellerId: number;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'sellerId' })
  seller: User;

  @ApiProperty({ example: 2 })
  @Column({ type: 'int' })
  categoryId: number;

  // Sin onDelete: la FK queda en NO ACTION y Postgres impide borrar una categoría con productos (23503)
  @ManyToOne(() => Category, { nullable: false })
  @JoinColumn({ name: 'categoryId' })
  category: Category;

  @ApiProperty({ example: '2026-11-10T12:00:00.000Z' })
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @ApiProperty({ example: '2026-11-10T12:00:00.000Z' })
  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
