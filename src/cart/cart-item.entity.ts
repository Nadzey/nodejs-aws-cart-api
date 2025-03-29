import { Entity, PrimaryGeneratedColumn, ManyToOne, Column } from 'typeorm';
import { Cart } from './cart.entity';
import { Product } from '../products/product.entity';

@Entity()
export class CartItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Cart, (cart) => cart.items)
  cart: Cart;

  @ManyToOne(() => Product, { nullable: false })
  product: Product;

  @Column('int')
  count: number;
}
