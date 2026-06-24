import { Injectable, HttpException, HttpStatus, Inject, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Order, OrderItem, OrderStatus } from './orders.model';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { CreateOrderItemDto } from './dto/create-order-item.dto';
import { UpdateOrderItemDto } from './dto/update-order-item.dto';
import { CreateOrderStatusDto } from './dto/create-order-status.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { User } from '../users/users.model';
import { Discount } from '../discounts/discounts.model';
import { Product } from '../products/products.model';
import { InventoryService } from '../inventory/inventory.service';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order)
    private orderModel: typeof Order,
    @InjectModel(OrderItem)
    private orderItemModel: typeof OrderItem,
    @InjectModel(OrderStatus)
    private orderStatusModel: typeof OrderStatus,
    @InjectModel(Product)
    private productModel: typeof Product,
    @Inject(forwardRef(() => InventoryService))
    private inventoryService: InventoryService,
  ) {}

  async create(createOrderDto: CreateOrderDto, userId: number): Promise<Order> {
  console.log('📦 Создание заказа:', createOrderDto);

  if (!createOrderDto.shipping_address) {
    throw new HttpException('Адрес доставки обязателен', HttpStatus.BAD_REQUEST);
  }
  if (!createOrderDto.items || createOrderDto.items.length === 0) {
    throw new HttpException('Заказ должен содержать товары', HttpStatus.BAD_REQUEST);
  }

  for (const item of createOrderDto.items) {
    const product = await this.productModel.findByPk(item.product_id);
    if (!product) {
      throw new HttpException(`Товар с ID ${item.product_id} не найден`, HttpStatus.NOT_FOUND);
    }

    try {
      const availability = await this.inventoryService.checkAvailability(
        item.product_id,
        item.quantity
      );
      
      if (!availability.available) {
        throw new HttpException(
          `Недостаточно товара "${product.name}". Доступно: ${availability.currentStock}, запрошено: ${item.quantity}`,
          HttpStatus.BAD_REQUEST
        );
      }

      await this.inventoryService.reduceStock(item.product_id, item.quantity);
      console.log(`✅ Зарезервировано ${item.quantity} шт. товара ${product.name}`);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      console.error(`❌ Ошибка проверки инвентаризации: ${error.message}`);
      throw new HttpException(
        `Ошибка проверки наличия товара: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  const orderData = {
    user_id: userId,
    order_number: `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    status_id: createOrderDto.status_id || 1,
    discount_id: createOrderDto.discount_id || null,
    total_amount: createOrderDto.total_amount || 0,
    shipping_address: createOrderDto.shipping_address,
    payment_method: createOrderDto.payment_method || 'cash',
  };

  const order = await this.orderModel.create(orderData as any);

  let totalAmount = 0;
  if (createOrderDto.items && createOrderDto.items.length > 0) {
    for (const item of createOrderDto.items) {
      const product = await this.productModel.findByPk(item.product_id);
      if (!product) {
        throw new HttpException(`Товар с ID ${item.product_id} не найден`, HttpStatus.NOT_FOUND);
      }
      
      const itemData = {
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.price || product.price,
      };
      await this.orderItemModel.create(itemData as any);
      totalAmount += itemData.price * itemData.quantity;
    }
  }

  await order.update({ total_amount: totalAmount });

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
    if (!id || isNaN(id)) {
      throw new HttpException('Некорректный ID заказа', HttpStatus.BAD_REQUEST);
    }
    const order = await this.orderModel.findByPk(id, {
      include: [
        { model: User },
        { model: OrderStatus, as: 'status' },
        { model: Discount },
        {
          model: OrderItem,
          include: [{ model: Product }],
        },
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
    return this.findOne(id);
  }

  async updateStatus(id: number, statusId: number): Promise<Order> {
    const order = await this.findOne(id);
    await order.update({ status_id: statusId });
    return this.findOne(id);
  }

  async cancel(id: number): Promise<Order> {
    const order = await this.findOne(id);
    try {
      const orderItems = await this.orderItemModel.findAll({
        where: { order_id: id },
      });
      
      for (const item of orderItems) {
        await this.inventoryService.addStock(item.product_id, item.quantity);
        console.log(`✅ Возвращено ${item.quantity} шт. товара ${item.product_id} на склад`);
      }
    } catch (error) {
      console.error(`❌ Ошибка возврата товаров: ${error.message}`);
    }
    
    await order.update({ status_id: 5 });
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const order = await this.findOne(id);
    await order.destroy();
  }

  async createOrderItem(createOrderItemDto: CreateOrderItemDto): Promise<OrderItem> {
    const order = await this.orderModel.findByPk(createOrderItemDto.order_id);
    if (!order) {
      throw new HttpException('Заказ не найден', HttpStatus.NOT_FOUND);
    }

    const itemData = {
      order_id: createOrderItemDto.order_id,
      product_id: createOrderItemDto.product_id,
      quantity: createOrderItemDto.quantity,
      price: createOrderItemDto.price,
    };
    return this.orderItemModel.create(itemData as any);
  }

  async findAllOrderItems(): Promise<OrderItem[]> {
    return this.orderItemModel.findAll({
      include: [
        { model: Order },
        { model: Product },
      ],
    });
  }

  async findByOrderOrderItems(orderId: number): Promise<OrderItem[]> {
    const order = await this.orderModel.findByPk(orderId);
    if (!order) {
      throw new HttpException('Заказ не найден', HttpStatus.NOT_FOUND);
    }

    return this.orderItemModel.findAll({
      where: { order_id: orderId },
      include: [{ model: Product }],
    });
  }

  async findOneOrderItem(id: number): Promise<OrderItem> {
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

  async updateOrderItem(id: number, updateOrderItemDto: UpdateOrderItemDto): Promise<OrderItem> {
    const item = await this.findOneOrderItem(id);
    await item.update(updateOrderItemDto);
    return this.findOneOrderItem(id);
  }

  async removeOrderItem(id: number): Promise<void> {
    const item = await this.findOneOrderItem(id);
    await item.destroy();
  }

  async createOrderStatus(createOrderStatusDto: CreateOrderStatusDto): Promise<OrderStatus> {
    const statusData = {
      status_name: createOrderStatusDto.status_name,
      description: createOrderStatusDto.description,
    };
    return this.orderStatusModel.create(statusData as any);
  }

  async findAllOrderStatuses(): Promise<OrderStatus[]> {
    return this.orderStatusModel.findAll();
  }

  async findOneOrderStatus(id: number): Promise<OrderStatus> {
    const status = await this.orderStatusModel.findByPk(id, {
      include: [{ model: Order }],
    });

    if (!status) {
      throw new HttpException('Статус не найден', HttpStatus.NOT_FOUND);
    }

    return status;
  }

  async updateOrderStatus(id: number, updateOrderStatusDto: UpdateOrderStatusDto): Promise<OrderStatus> {
    const status = await this.findOneOrderStatus(id);
    await status.update(updateOrderStatusDto);
    return this.findOneOrderStatus(id);
  }

  async removeOrderStatus(id: number): Promise<void> {
    const status = await this.findOneOrderStatus(id);
    await status.destroy();
  }
}