import { Column, DataType, Model, Table, HasMany } from 'sequelize-typescript';
import { ApiProperty } from '@nestjs/swagger';
import { Order } from '../orders/orders.model';

@Table({ tableName: 'order_statuses', timestamps: false })
export class OrderStatus extends Model<OrderStatus> {
  @ApiProperty({ example: '1', description: 'Уникальный идентификатор' })
  @Column({ type: DataType.INTEGER, autoIncrement: true, primaryKey: true })
  declare id: number;

  @ApiProperty({ example: 'pending', description: 'Название статуса' })
  @Column({ type: DataType.STRING, unique: true, allowNull: false })
  declare status_name: string;

  @ApiProperty({ example: 'Заказ ожидает обработки', description: 'Описание' })
  @Column({ type: DataType.STRING })
  declare description: string;

  @HasMany(() => Order)
  orders: Order[];
}