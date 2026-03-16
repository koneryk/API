import { Column, DataType, Model, Table, ForeignKey, BelongsTo, HasMany } from 'sequelize-typescript';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../users/users.model';
import { OrderStatus } from '../order-statuses/order-statuses.model';
import { Discount } from '../discounts/discounts.model';
import { OrderItem } from '../order-items/order-items.model';

@Table({ tableName: 'orders', timestamps: true, createdAt: 'created_at', updatedAt: false })
export class Order extends Model<Order> {
  @ApiProperty({ example: '1', description: 'Уникальный идентификатор' })
  @Column({ type: DataType.INTEGER, autoIncrement: true, primaryKey: true })
  declare id: number;

  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER, allowNull: false })
  declare user_id: number;

  @ApiProperty({ example: 'ORD-20260301-001', description: 'Номер заказа' })
  @Column({ type: DataType.STRING, unique: true, allowNull: false })
  declare order_number: string;

  @ForeignKey(() => OrderStatus)
  @Column({ type: DataType.INTEGER, allowNull: false })
  declare status_id: number;

  @ForeignKey(() => Discount)
  @Column({ type: DataType.INTEGER })
  declare discount_id: number;

  @ApiProperty({ example: '3500.00', description: 'Общая сумма' })
  @Column({ type: DataType.DECIMAL(10,2), allowNull: false })
  declare total_amount: number;

  @ApiProperty({ example: 'г. Москва, ул. Ленина...', description: 'Адрес доставки' })
  @Column({ type: DataType.TEXT, allowNull: false })
  declare shipping_address: string;

  @ApiProperty({ example: 'card', description: 'Способ оплаты' })
  @Column({ type: DataType.STRING })
  declare payment_method: string;

  @ApiProperty({ example: 'TRACK123456', description: 'Трек-номер' })
  @Column({ type: DataType.STRING })
  declare tracking_number: string;

  @ApiProperty({ example: '2026-03-05 15:30:00', description: 'Дата доставки' })
  @Column({ type: DataType.DATE })
  declare delivered_at: Date;

  @BelongsTo(() => User)
  user: User;

  @BelongsTo(() => OrderStatus)
  status: OrderStatus;

  @BelongsTo(() => Discount)
  discount: Discount;

  @HasMany(() => OrderItem)
  items: OrderItem[];
}