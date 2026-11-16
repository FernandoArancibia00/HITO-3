import {
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  Column,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Transaction } from './transaction.entity';

export enum OrderStatus {
  PENDING = 'pendiente',
  PAID = 'pagado',
  SHIPPED = 'enviado',
  READY_FOR_PICKUP = 'listo_retiro',
  DELIVERED = 'entregado',
  CANCELLED = 'cancelado',
}

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'int' })
  buyerId!: number;

  @Column({ type: 'int' })
  total!: number;

  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.PENDING })
  status!: OrderStatus;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'buyerId' })
  buyer!: User;

  @OneToMany(() => Transaction, (transaction) => transaction.order)
  transactions!: Transaction[];

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;
}
