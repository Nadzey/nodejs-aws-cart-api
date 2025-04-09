import {
  Controller,
  Get,
  Delete,
  Put,
  Body,
  Req,
  UseGuards,
  HttpStatus,
  HttpCode,
  BadRequestException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { BasicAuthGuard } from '../auth';
import { OrderService } from '../order/services/order.service';
import { Order } from '../order/order.entity';
import { AppRequest, getUserIdFromRequest } from '../shared';
import { calculateCartTotal } from './models-rules';
import { CartService } from './services/cart.service';
import { CartItem } from './cart-item.entity';
import { CreateOrderDto, PutCartPayload } from '../order/type';

@Controller('profile/cart')
export class CartController {
  constructor(
    @Inject(forwardRef(() => CartService))
    private readonly cartService: CartService,
    @Inject(forwardRef(() => OrderService))
    private readonly orderService: OrderService,
  ) {
    console.log('[DEBUG] CartService injected:', !!cartService);
  }

  @UseGuards(BasicAuthGuard)
  @Get()
  async findUserCart(@Req() req: AppRequest): Promise<CartItem[]> {
    const cart = await this.cartService.findOrCreateByUserId(getUserIdFromRequest(req));
    return cart.items;
  }

  @UseGuards(BasicAuthGuard)
  @Put()
  async updateUserCart(
    @Req() req: AppRequest,
    @Body() body: PutCartPayload,
  ): Promise<CartItem[]> {
    const cart = await this.cartService.updateByUserId(
      getUserIdFromRequest(req),
      body,
    );
    return cart.items;
  }

  @UseGuards(BasicAuthGuard)
  @Delete()
  @HttpCode(HttpStatus.OK)
  async clearUserCart(@Req() req: AppRequest) {
    await this.cartService.removeByUserId(getUserIdFromRequest(req));
  }

  @UseGuards(BasicAuthGuard)
  @Put('order')
  async checkout(@Req() req: AppRequest, @Body() body: CreateOrderDto) {
    const userId = getUserIdFromRequest(req);
    const cart = await this.cartService.findByUserId(userId);

    if (!(cart && cart.items.length)) {
      throw new BadRequestException('Cart is empty');
    }

    const { id: cartId, items } = cart;
    const total = calculateCartTotal(items);

    const order = await this.orderService.create({
      userId,
      cartId,
      address: body.address,
      items: items.map(({ product, count }) => ({
        productId: product.id,
        count,
      })),
      payment: {
        method: 'mock',
        amount: total,
      },
      delivery: {
        address: body.address.address,
        city: 'Philadelphia',
        zip: '19100',
      },
      comments: body.address.comment || 'Auto-generated order',
      total,
    });

    await this.cartService.removeByUserId(userId);

    return { order };
  }

  @UseGuards(BasicAuthGuard)
  @Get('order')
  async getOrder(@Req() req: AppRequest): Promise<Order[]> {
    const userId = getUserIdFromRequest(req);
    return this.orderService.getAll();
  }
}
