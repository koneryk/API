import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Order } from './orders.model';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { OrderItem } from '../order-items/order-items.model';
import { User } from '../users/users.model';
import { OrderStatus } from '../order-statuses/order-statuses.model';
import { Discount } from '../discounts/discounts.model';
import { Product } from '../products/products.model';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order)
    private orderModel: typeof Order,
  ) {}

  async create(createOrderDto: CreateOrderDto, userId: number): Promise<Order> {
    const orderData = {
      user_id: userId,
      order_number: `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      status_id: createOrderDto.status_id,
      discount_id: createOrderDto.discount_id,
      total_amount: createOrderDto.total_amount,
      shipping_address: createOrderDto.shipping_address,
      payment_method: createOrderDto.payment_method,
    };

    const order = await this.orderModel.create(orderData as any);

    if (createOrderDto.items && createOrderDto.items.length > 0) {
      for (const item of createOrderDto.items) {
        const itemData = {
          order_id: order.id,
          product_id: item.product_id,
          quantity: item.quantity,
          price: item.price,
        };
        await OrderItem.create(itemData as any);
      }
    }

    return this.findOne(order.id);
  }

  async findAll(): Promise<Order[]> {
    return this.orderModel.findAll({
      include: [
        { model: User },
        { model: OrderStatus },
        { model: Discount },
        { model: OrderItem, include: [{ model: Product }] },
      ],
    });
  }

  async findByUser(userId: number): Promise<Order[]> {
    return this.orderModel.findAll({
      where: { user_id: userId },
      include: [
        { model: OrderStatus },
        { model: OrderItem, include: [{ model: Product }] },
      ],
    });
  }

  async findByStatus(statusId: number): Promise<Order[]> {
    return this.orderModel.findAll({
      where: { status_id: statusId },
      include: [
        { model: User },
        { model: OrderItem, include: [{ model: Product }] },
      ],
    });
  }

  async findOne(id: number): Promise<Order> {
    const order = await this.orderModel.findByPk(id, {
      include: [
        { model: User },
        { model: OrderStatus },
        { model: Discount },
        { model: OrderItem, include: [{ model: Product }] },
      ],
    });

    if (!order) {
      throw new HttpException('Заказ не найден', HttpStatus.NOT_FOUND);
    }

    return order;
  }

  async findByOrderNumber(orderNumber: string): Promise<Order> {
    const order = await this.orderModel.findOne({
      where: { order_number: orderNumber },
      include: [
        { model: User },
        { model: OrderStatus },
        { model: OrderItem, include: [{ model: Product }] },
      ],
    });

    if (!order) {
      throw new HttpException('Заказ не найден', HttpStatus.NOT_FOUND);
    }

    return order;
  }

  async update(id: number, updateOrderDto: UpdateOrderDto): Promise<Order> {
    const order = await this.findOne(id);

    const { items, ...updateData } = updateOrderDto;
    await order.update(updateData);

    return order;
  }

  async updateStatus(id: number, statusId: number): Promise<Order> {
    const order = await this.findOne(id);
    await order.update({ status_id: statusId });
    return order;
  }

  async cancel(id: number): Promise<Order> {
    const order = await this.findOne(id);
    await order.update({
      status_id: 6,
    });
    return order;
  }

  async remove(id: number): Promise<void> {
    const order = await this.findOne(id);
    await order.destroy();
  }
}