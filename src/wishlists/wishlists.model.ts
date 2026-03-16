import { Column, DataType, Model, Table, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../users/users.model';
import { Product } from '../products/products.model';

@Table({ tableName: 'wishlists', timestamps: true, createdAt: 'created_at', updatedAt: false })
export class Wishlist extends Model<Wishlist> {
  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER, allowNull: false, primaryKey: true })
  declare user_id: number;

  @ForeignKey(() => Product)
  @Column({ type: DataType.INTEGER, allowNull: false, primaryKey: true })
  declare product_id: number;

  @ApiProperty({ example: '2026-03-01 10:00:00', description: 'Дата добавления' })
  @Column({ type: DataType.DATE, defaultValue: DataType.NOW })
  declare created_at: Date;

  @BelongsTo(() => User)
  user: User;

  @BelongsTo(() => Product)
  product: Product;
}