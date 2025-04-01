import 'reflect-metadata';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../users/user.entity';
import { Cart } from '../cart/cart.entity';

export enum OrderStatus {
  CREATED = 'CREATED',
  PAID = 'PAID',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
}

interface PaymentData {
  method: string;
  card_last4?: string;
  email?: string;
  amount: number;
}

interface DeliveryData {
  address: string;
  city: string;
  zip: string;
}

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ name: 'cart_id', type: 'uuid' })
  cartId: string;

  @Column('jsonb')
  items: Array<{ productId: string; count: number }>;

  @Column('jsonb')
  payment: PaymentData;

  @Column('jsonb')
  delivery: DeliveryData;

  @Column('text', { nullable: true })
  comments: string;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.CREATED,
  })
  status: OrderStatus;

  @Column('decimal', {
    precision: 10,
    scale: 2,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    },
  })
  total: number;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamp',
  })
  updatedAt: Date;

  @ManyToOne(() => Cart)
  cart: Cart;
}
