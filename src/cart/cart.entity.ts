import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { CartItem } from './cart-item.entity';

@Entity()
export class Cart {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  user_id: string;

  @Column('timestamp')
  created_at: Date;

  @Column('timestamp')
  updated_at: Date;

  @Column({ type: 'enum', enum: ['OPEN', 'ORDERED'] })
  status: 'OPEN' | 'ORDERED';

  @OneToMany(() => CartItem, (cartItem) => cartItem.cart)
  items: CartItem[];
}
