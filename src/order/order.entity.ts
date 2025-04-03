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

interface OrderItem {
  productId: string;
  count: number;
}

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ name: 'cart_id', type: 'uuid' })
  cartId: string;

  @Column('jsonb')
  items: OrderItem[];

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

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;

  @ManyToOne(() => Cart)
  @JoinColumn({ name: 'cart_id' })
  cart: Cart;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
