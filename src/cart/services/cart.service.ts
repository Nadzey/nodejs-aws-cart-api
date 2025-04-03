import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cart } from '../cart.entity';
import { CartItem } from '../cart-item.entity';
import { Product } from '../../products/product.entity';
import { PutCartPayload } from 'src/order/type';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart)
    private cartRepository: Repository<Cart>,
    @InjectRepository(CartItem)
    private cartItemRepository: Repository<CartItem>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {
    console.log('[DEBUG] CartRepository:', !!cartRepository);
    console.log('[DEBUG] CartItemRepository:', !!cartItemRepository);
    console.log('[DEBUG] ProductRepository:', !!productRepository);
  }

  async findByUserId(userId: string): Promise<Cart> {
    return this.cartRepository.findOne({
      where: { user_id: userId },
      relations: ['items'],
    });
  }

  async createByUserId(user_id: string): Promise<Cart> {
    const timestamp = new Date();

    const newCart = this.cartRepository.create({
      user_id,
      created_at: timestamp,
      updated_at: timestamp,
      status: 'OPEN',
      items: [],
    });

    return await this.cartRepository.save(newCart);
  }

  async findOrCreateByUserId(userId: string): Promise<Cart> {
    let userCart = await this.findByUserId(userId);
    if (!userCart) {
      userCart = await this.createByUserId(userId);
    }
    return userCart;
  }

  async updateByUserId(userId: string, payload: PutCartPayload): Promise<Cart> {
    const userCart = await this.findOrCreateByUserId(userId);

    const cartItem = await this.cartItemRepository.findOne({
      where: { cart: { id: userCart.id }, product: { id: payload.product.id } }, 
    });

    if (!cartItem) {
      const newCartItem = this.cartItemRepository.create({
        cart: userCart,
        product: { id: payload.product.id },
        count: payload.count,
      });
      await this.cartItemRepository.save(newCartItem);
      userCart.items.push(newCartItem);
    } else if (payload.count === 0) {
      await this.cartItemRepository.remove(cartItem);
      userCart.items = userCart.items.filter(item => item.id !== cartItem.id);
    } else {
      cartItem.count = payload.count;
      await this.cartItemRepository.save(cartItem);
    }

    userCart.updated_at = new Date();
    await this.cartRepository.save(userCart);

    return userCart;
  }

  async removeByUserId(userId: string): Promise<void> {
    const userCart = await this.findByUserId(userId);
    if (userCart) {
      await this.cartItemRepository.remove(userCart.items);
      await this.cartRepository.remove(userCart);    
    }
  }
}
