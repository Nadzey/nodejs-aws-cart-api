import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderStatus } from '../order.entity';
import { CreateOrderPayload } from '../type';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
  ) {}

  async getAll(): Promise<Order[]> {
    return await this.orderRepository.find({ order: { createdAt: 'DESC' } });
  }

  async findById(orderId: string): Promise<Order | null> {
    return await this.orderRepository.findOne({ where: { id: orderId } });
  }

  async create(data: CreateOrderPayload): Promise<Order> {
    const newOrder = this.orderRepository.create({
      ...data,
      status: OrderStatus.CREATED,
    });

    return await this.orderRepository.save(newOrder);
  }

  async update(orderId: string, updatedData: Partial<Order>): Promise<Order> {
    const order = await this.findById(orderId);
    if (!order) {
      throw new Error('Order does not exist.');
    }

    const updatedOrder = this.orderRepository.merge(order, updatedData);
    return await this.orderRepository.save(updatedOrder);
  }
}
