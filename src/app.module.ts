import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { CartModule } from './cart/cart.module';
import { AuthModule } from './auth/auth.module';
import { OrderModule } from './order/order.module';
import { ConfigModule } from '@nestjs/config';
import { Cart } from './cart/cart.entity';
import { CartItem } from './cart/cart-item.entity';
import { Product } from './products/product.entity';

@Module({
  imports: [
    AuthModule, 
    CartModule, 
    OrderModule, 

    ConfigModule.forRoot(), 
    
    TypeOrmModule.forRoot({
      type: 'postgres', 
      host: process.env.DB_HOST,
      port: 5432,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [Cart, CartItem, Product],
      synchronize: false,
      logging: true, 
      ssl: true,
    }),
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
