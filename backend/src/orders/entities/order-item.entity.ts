import {
  Check,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Order } from './order.entity';
import { Product } from '../../products/entities/product.entity';
import { User } from '../../users/entities/user.entity';

@Check('CHK_order_items_quantity_positive', '"quantity" >= 1')
@Check('CHK_order_items_unit_price_positive', '"unitPrice" > 0')
@Entity('order_items')
export class OrderItem {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'int' })
  orderId!: number;

  @Column({ type: 'int' })
  productId!: number;

  @Column({ type: 'int' })
  sellerId!: number;

  @Column({ type: 'int' })
  quantity!: number;

  @Column({ type: 'int' })
  unitPrice!: number;

  @ManyToOne(() => Order, { nullable: false })
  @JoinColumn({ name: 'orderId' })
  order!: Order;

  @ManyToOne(() => Product, { nullable: false })
  @JoinColumn({ name: 'productId' })
  product!: Product;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'sellerId' })
  seller!: User;
}
