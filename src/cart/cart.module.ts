import { Module } from '@nestjs/common';

import { OrderModule } from '../order/order.module';

import { CartController } from './cart.controller';
import { CartService } from './services';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cart } from './cart.entity';
import { CartItem } from './cart-item.entity';
import { Product } from '../products/product.entity';
@Module({
  imports: [OrderModule,
    TypeOrmModule.forFeature([Cart, CartItem, Product]),
  ],
  providers: [CartService],
  controllers: [CartController],
})
export class CartModule {}
