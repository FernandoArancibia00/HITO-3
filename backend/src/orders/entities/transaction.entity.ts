import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Order } from './order.entity';

export enum TransactionMethod {
  SIMULATED = 'simulado',
}

export enum TransactionStatus {
  APPROVED = 'aprobada',
  REJECTED = 'rechazada',
}

@Check('CHK_transactions_amount_positive', '"amount" > 0')
@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'int' })
  orderId!: number;

  @Column({ type: 'int' })
  amount!: number;

  @Column({ type: 'enum', enum: TransactionMethod })
  method!: TransactionMethod;

  @Column({ type: 'enum', enum: TransactionStatus })
  status!: TransactionStatus;

  @ManyToOne(() => Order, (order) => order.transactions, { nullable: false })
  @JoinColumn({ name: 'orderId' })
  order!: Order;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;
}
