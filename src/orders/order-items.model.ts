import { Column, DataType, Model, Table, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { ApiProperty } from '@nestjs/swagger';
import { Order } from './orders.model';
import { Product } from '../products/products.model';

@Table({ tableName: 'order_items', timestamps: false })
export class OrderItem extends Model<OrderItem> {
  @ApiProperty({ example: '1', description: 'Уникальный идентификатор' })
  @Column({ type: DataType.INTEGER, autoIncrement: true, primaryKey: true })
  declare id: number;

  @ForeignKey(() => Order)
  @Column({ type: DataType.INTEGER, allowNull: false })
  declare order_id: number;

  @ForeignKey(() => Product)
  @Column({ type: DataType.INTEGER, allowNull: false })
  declare product_id: number;

  @ApiProperty({ example: '2', description: 'Количество' })
  @Column({ type: DataType.INTEGER, allowNull: false })
  declare quantity: number;

  @ApiProperty({ example: '1500.00', description: 'Цена за единицу' })
  @Column({ type: DataType.DECIMAL(10,2), allowNull: false })
  declare price: number;

  @BelongsTo(() => Order)
  order: Order;

  @BelongsTo(() => Product)
  product: Product;
}