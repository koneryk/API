import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { OrderStatus } from './order-statuses.model';
import { CreateOrderStatusDto } from './dto/create-order-status.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { Order } from '../orders/orders.model';

@Injectable()
export class OrderStatusesService {
  constructor(
    @InjectModel(OrderStatus)
    private orderStatusModel: typeof OrderStatus,
  ) {}

  async create(createOrderStatusDto: CreateOrderStatusDto): Promise<OrderStatus> {
    const statusData = {
      status_name: createOrderStatusDto.status_name,
      description: createOrderStatusDto.description,
    };
    return this.orderStatusModel.create(statusData as any);
  }

  async findAll(): Promise<OrderStatus[]> {
    return this.orderStatusModel.findAll({
      include: [{ model: Order }],
    });
  }

  async findOne(id: number): Promise<OrderStatus> {
    const status = await this.orderStatusModel.findByPk(id, {
      include: [{ model: Order }],
    });

    if (!status) {
      throw new HttpException('Статус не найден', HttpStatus.NOT_FOUND);
    }

    return status;
  }

  async update(id: number, updateOrderStatusDto: UpdateOrderStatusDto): Promise<OrderStatus> {
    const status = await this.findOne(id);
    await status.update(updateOrderStatusDto);
    return status;
  }

  async remove(id: number): Promise<void> {
    const status = await this.findOne(id);
    await status.destroy();
  }
}