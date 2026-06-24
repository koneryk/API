import { Column, DataType, Model, Table, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { ApiProperty } from '@nestjs/swagger';
import { Product } from '../products/products.model';

@Table({ tableName: 'product_inventory', timestamps: true, createdAt: 'created_at', updatedAt: 'updated_at' })
export class ProductInventory extends Model<ProductInventory> {
  @ApiProperty({ example: '1', description: 'Уникальный идентификатор' })
  @Column({ type: DataType.INTEGER, autoIncrement: true, primaryKey: true })
  declare id: number;

  @ForeignKey(() => Product)
  @Column({ type: DataType.INTEGER, allowNull: false, unique: true })
  declare product_id: number;

  @ApiProperty({ example: 100, description: 'Общее количество товара на всех складах' })
  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0 })
  declare quantity: number;

  @ApiProperty({ example: 5, description: 'Минимальный остаток для уведомления' })
  @Column({ type: DataType.INTEGER, defaultValue: 5 })
  declare min_stock: number;

  @ApiProperty({ example: true, description: 'Доступен ли товар для заказа' })
  @Column({ type: DataType.BOOLEAN, defaultValue: true })
  declare is_available: boolean;

  @ApiProperty({ example: '2026-03-01 10:00:00', description: 'Дата создания' })
  @Column({ type: DataType.DATE, defaultValue: DataType.NOW })
  declare created_at: Date;

  @ApiProperty({ example: '2026-03-01 10:00:00', description: 'Дата обновления' })
  @Column({ type: DataType.DATE, defaultValue: DataType.NOW })
  declare updated_at: Date;

  @BelongsTo(() => Product)
  product: Product;
}