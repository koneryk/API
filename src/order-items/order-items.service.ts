import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { OrderItem } from './order-items.model';
import { CreateOrderItemDto } from './dto/create-order-item.dto';
import { UpdateOrderItemDto } from './dto/update-order-item.dto';
import { Order } from '../orders/orders.model';
import { Product } from '../products/products.model';

@Injectable()
export class OrderItemsService {
  constructor(
    @InjectModel(OrderItem)
    private orderItemModel: typeof OrderItem,
  ) {}

  async create(createOrderItemDto: CreateOrderItemDto): Promise<OrderItem> {
    const itemData = {
      order_id: createOrderItemDto.order_id,
      product_id: createOrderItemDto.product_id,
      quantity: createOrderItemDto.quantity,
      price: createOrderItemDto.price,
    };
    return this.orderItemModel.create(itemData as any); 
  }

  async findAll(): Promise<OrderItem[]> {
    return this.orderItemModel.findAll({
      include: [
        { model: Order },
        { model: Product },
      ],
    });
  }

  async findByOrder(orderId: number): Promise<OrderItem[]> {
    return this.orderItemModel.findAll({
      where: { order_id: orderId },
      include: [{ model: Product }],
    });
  }

  async findOne(id: number): Promise<OrderItem> {
    const item = await this.orderItemModel.findByPk(id, {
      include: [
        { model: Order },
        { model: Product },
      ],
    });

    if (!item) {
      throw new HttpException('Позиция заказа не найдена', HttpStatus.NOT_FOUND);
    }

    return item;
  }

  async update(id: number, updateOrderItemDto: UpdateOrderItemDto): Promise<OrderItem> {
    const item = await this.findOne(id);
    await item.update(updateOrderItemDto);
    return item;
  }

  async remove(id: number): Promise<void> {
    const item = await this.findOne(id);
    await item.destroy();
  }
}