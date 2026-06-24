import { Column, DataType, Model, Table, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../users/users.model';
import { Product } from '../products/products.model';

@Table({ tableName: 'cart_items', timestamps: true, createdAt: 'created_at', updatedAt: 'updated_at' })
export class CartItem extends Model<CartItem> {
  @ApiProperty({ example: '1', description: 'Уникальный идентификатор' })
  @Column({ type: DataType.INTEGER, autoIncrement: true, primaryKey: true })
  declare id: number;

  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER, allowNull: false })
  declare user_id: number;

  @ForeignKey(() => Product)
  @Column({ type: DataType.INTEGER, allowNull: false })
  declare product_id: number;

  @ApiProperty({ example: 2, description: 'Количество' })
  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 1 })
  declare quantity: number;

  @ApiProperty({ example: '2026-03-01 10:00:00', description: 'Дата добавления' })
  @Column({ type: DataType.DATE, defaultValue: DataType.NOW })
  declare created_at: Date;

  @ApiProperty({ example: '2026-03-01 10:00:00', description: 'Дата обновления' })
  @Column({ type: DataType.DATE, defaultValue: DataType.NOW })
  declare updated_at: Date;

  @BelongsTo(() => User)
  user: User;

  @BelongsTo(() => Product)
  product: Product;
}