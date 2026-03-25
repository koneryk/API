import { Column, DataType, Model, Table, BelongsToMany } from 'sequelize-typescript';
import { ApiProperty } from '@nestjs/swagger';
import { Product } from '../products/products.model';
import { DiscountProduct } from '../discount-products/discount-products.model';

@Table({ tableName: 'discounts', timestamps: true, updatedAt: 'updated_at', createdAt: 'created_at' })
export class Discount extends Model<Discount> {
  @ApiProperty({ example: '1', description: 'Уникальный идентификатор' })
  @Column({ type: DataType.INTEGER, autoIncrement: true, primaryKey: true })
  declare id: number;

  @ApiProperty({ example: 'SUMMER10', description: 'Код скидки' })
  @Column({ type: DataType.STRING, unique: true, allowNull: false })
  declare code: string;

  @ApiProperty({ example: 'Летняя скидка', description: 'Название' })
  @Column({ type: DataType.STRING, allowNull: false })
  declare name: string;

  @ApiProperty({ example: 'percentage', description: 'Тип скидки' })
  @Column({ type: DataType.STRING, allowNull: false })
  declare type: string;

  @ApiProperty({ example: '10.00', description: 'Значение скидки' })
  @Column({ type: DataType.DECIMAL(10,2), allowNull: false })
  declare value: number;

  @ApiProperty({ example: '1000.00', description: 'Мин. сумма заказа' })
  @Column({ type: DataType.DECIMAL(10,2) })
  declare min_order: number;

  @ApiProperty({ example: '2026-03-01', description: 'Дата начала' })
  @Column({ type: DataType.DATE, allowNull: false })
  declare start_date: Date;

  @ApiProperty({ example: '2026-04-01', description: 'Дата окончания' })
  @Column({ type: DataType.DATE, allowNull: false })
  declare end_date: Date;

  @ApiProperty({ example: true, description: 'Активна ли скидка' })
  @Column({ type: DataType.BOOLEAN, defaultValue: true })
  declare is_active: boolean;

  @BelongsToMany(() => Product, () => DiscountProduct)
  products: Product[];
}