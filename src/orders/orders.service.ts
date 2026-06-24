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

interface ReservedItem {
  product_id: number;
  quantity: number;
  product: Product;
}

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

  async create(createOrderDto: CreateOrderDto, userId: Order["user_id"]): Promise<Order> {
    console.log('Создание заказа:', createOrderDto);

    if (!createOrderDto.shipping_address) {
      throw new HttpException('Адрес доставки обязателен', HttpStatus.BAD_REQUEST);
    }
    if (!createOrderDto.items || createOrderDto.items.length === 0) {
      throw new HttpException('Заказ должен содержать товары', HttpStatus.BAD_REQUEST);
    }

    const reservedItems: ReservedItem[] = [];
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
        console.log(`Зарезервировано ${item.quantity} шт. товара "${product.name}"`);
        
        reservedItems.push({
          product_id: item.product_id,
          quantity: item.quantity,
          product: product,
        });
      } catch (error) {
        for (const reserved of reservedItems) {
          await this.inventoryService.addStock(reserved.product_id, reserved.quantity);
          console.log(`Возвращено ${reserved.quantity} шт. товара ${reserved.product_id} (отмена резерва)`);
        }
        
        if (error instanceof HttpException) throw error;
        console.error(`Ошибка проверки инвентаризации: ${error.message}`);
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
          for (const reserved of reservedItems) {
            await this.inventoryService.addStock(reserved.product_id, reserved.quantity);
          }
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

    console.log(`Заказ создан ID: ${order.id}, сумма: ${totalAmount} руб.`);
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
      order: [['created_at', 'DESC']],
    });
  }

  async findByUser(userId: Order["user_id"]): Promise<Order[]> {
    return this.orderModel.findAll({
      where: { user_id: userId },
      include: [
        { model: OrderStatus },
        { model: OrderItem, include: [{ model: Product }] },
      ],
      order: [['created_at', 'DESC']],
    });
  }

  async findByStatus(statusId: Order["status_id"]): Promise<Order[]> {
    return this.orderModel.findAll({
      where: { status_id: statusId },
      include: [
        { model: User },
        { model: OrderItem, include: [{ model: Product }] },
      ],
      order: [['created_at', 'DESC']],
    });
  }

  async findOne(id: Order["id"]): Promise<Order> {
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

  async findByOrderNumber(orderNumber: Order["order_number"]): Promise<Order> {
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

  async update(id: Order["id"], updateOrderDto: UpdateOrderDto): Promise<Order> {
    const order = await this.findOne(id);
    const { items, ...updateData } = updateOrderDto;
    await order.update(updateData);
    return this.findOne(id);
  }

  async updateStatus(id: Order["id"], statusId: Order["status_id"]): Promise<Order> {
    const order = await this.findOne(id);
    const oldStatusId = order.status_id;
    
    if (statusId === 5 && oldStatusId !== 5) {
      await this.returnOrderItems(id);
    }
    
    await order.update({ status_id: statusId });
    console.log(`Статус заказа ${id} изменён: ${oldStatusId} → ${statusId}`);
    
    return this.findOne(id);
  }

  async cancel(id: Order["id"]): Promise<Order> {
    const order = await this.findOne(id);
    
    if (order.status_id === 5) {
      throw new HttpException('Заказ уже отменён', HttpStatus.BAD_REQUEST);
    }

    await this.returnOrderItems(id);
    
    await order.update({ status_id: 5 });
    console.log(`Заказ ${id} отменён, товары возвращены на склад`);
    
    return this.findOne(id);
  }

  async remove(id: Order["id"]): Promise<void> {
    const order = await this.findOne(id);
    
    if (order.status_id !== 5) {
      await this.returnOrderItems(id);
    }
    
    await order.destroy();
    console.log(`Заказ ${id} удалён`);
  }

  private async returnOrderItems(orderId: Order["id"]): Promise<void> {
    const orderItems = await this.orderItemModel.findAll({
      where: { order_id: orderId },
    });
    
    if (orderItems.length === 0) {
      console.log(`В заказе ${orderId} нет товаров для возврата`);
      return;
    }

    console.log(`Возврат товаров из заказа ${orderId}...`);
    
    for (const item of orderItems) {
      try {
        await this.inventoryService.addStock(item.product_id, item.quantity);
        console.log(`Возвращено ${item.quantity} шт. товара ${item.product_id} на склад`);
      } catch (error) {
        console.error(`Ошибка возврата товара ${item.product_id}: ${error.message}`);
        throw new HttpException(
          `Ошибка возврата товаров: ${error.message}`,
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      }
    }
  }

  async createOrderItem(createOrderItemDto: CreateOrderItemDto): Promise<OrderItem> {
    const order = await this.orderModel.findByPk(createOrderItemDto.order_id);
    if (!order) {
      throw new HttpException('Заказ не найден', HttpStatus.NOT_FOUND);
    }

    const product = await this.productModel.findByPk(createOrderItemDto.product_id);
    if (!product) {
      throw new HttpException('Товар не найден', HttpStatus.NOT_FOUND);
    }

    const availability = await this.inventoryService.checkAvailability(
      createOrderItemDto.product_id,
      createOrderItemDto.quantity
    );
    
    if (!availability.available) {
      throw new HttpException(
        `Недостаточно товара. Доступно: ${availability.currentStock}`,
        HttpStatus.BAD_REQUEST
      );
    }

    await this.inventoryService.reduceStock(
      createOrderItemDto.product_id,
      createOrderItemDto.quantity
    );

    const itemData = {
      order_id: createOrderItemDto.order_id,
      product_id: createOrderItemDto.product_id,
      quantity: createOrderItemDto.quantity,
      price: createOrderItemDto.price,
    };
    
    const orderItem = await this.orderItemModel.create(itemData as any);
    await this.updateOrderTotal(order.id);
    
    return orderItem;
  }

  async findAllOrderItems(): Promise<OrderItem[]> {
    return this.orderItemModel.findAll({
      include: [
        { model: Order },
        { model: Product },
      ],
    });
  }

  async findByOrderOrderItems(orderId: OrderItem["order_id"]): Promise<OrderItem[]> {
    const order = await this.orderModel.findByPk(orderId);
    if (!order) {
      throw new HttpException('Заказ не найден', HttpStatus.NOT_FOUND);
    }

    return this.orderItemModel.findAll({
      where: { order_id: orderId },
      include: [{ model: Product }],
    });
  }

  async findOneOrderItem(id: OrderItem["id"]): Promise<OrderItem> {
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

  async updateOrderItem(id: OrderItem["id"], updateOrderItemDto: UpdateOrderItemDto): Promise<OrderItem> {
    const item = await this.findOneOrderItem(id);
    const oldQuantity = item.quantity;
    
    if (updateOrderItemDto.quantity !== undefined) {
      const diff = updateOrderItemDto.quantity - oldQuantity;
      
      if (diff > 0) {
        const availability = await this.inventoryService.checkAvailability(
          item.product_id,
          diff
        );
        if (!availability.available) {
          throw new HttpException(
            `Недостаточно товара. Доступно: ${availability.currentStock}`,
            HttpStatus.BAD_REQUEST
          );
        }
        await this.inventoryService.reduceStock(item.product_id, diff);
        console.log(`Зарезервировано ещё ${diff} шт. товара ${item.product_id}`);
      } else if (diff < 0) {
        await this.inventoryService.addStock(item.product_id, Math.abs(diff));
        console.log(`Возвращено ${Math.abs(diff)} шт. товара ${item.product_id} на склад`);
      }
    }
    
    await item.update(updateOrderItemDto);
    
    await this.updateOrderTotal(item.order_id);
    
    return this.findOneOrderItem(id);
  }

  async removeOrderItem(id: OrderItem["id"]): Promise<void> {
    const item = await this.findOneOrderItem(id);
    const orderId = item.order_id;
    
    await this.inventoryService.addStock(item.product_id, item.quantity);
    console.log(`Возвращено ${item.quantity} шт. товара ${item.product_id} на склад`);
    
    await item.destroy();
    
    await this.updateOrderTotal(orderId);
  }

  private async updateOrderTotal(orderId: Order["id"]): Promise<void> {
    const orderItems = await this.orderItemModel.findAll({
      where: { order_id: orderId },
    });
    
    const totalAmount = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    await this.orderModel.update(
      { total_amount: totalAmount },
      { where: { id: orderId } }
    );
    console.log(`Обновлена сумма заказа ${orderId}: ${totalAmount} руб.`);
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

  async findOneOrderStatus(id: OrderStatus["id"]): Promise<OrderStatus> {
    const status = await this.orderStatusModel.findByPk(id, {
      include: [{ model: Order }],
    });

    if (!status) {
      throw new HttpException('Статус не найден', HttpStatus.NOT_FOUND);
    }

    return status;
  }

  async updateOrderStatus(id: OrderStatus["id"], updateOrderStatusDto: UpdateOrderStatusDto): Promise<OrderStatus> {
    const status = await this.findOneOrderStatus(id);
    await status.update(updateOrderStatusDto);
    return this.findOneOrderStatus(id);
  }

  async removeOrderStatus(id: OrderStatus["id"]): Promise<void> {
    const status = await this.findOneOrderStatus(id);
    await status.destroy();
  }
}