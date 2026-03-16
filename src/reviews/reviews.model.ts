import { Column, DataType, Model, Table, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { ApiProperty } from '@nestjs/swagger';
import { Product } from '../products/products.model';
import { User } from '../users/users.model';

@Table({ tableName: 'reviews', timestamps: true, createdAt: 'created_at', updatedAt: false })
export class Review extends Model<Review> {
  @ApiProperty({ example: '1', description: 'Уникальный идентификатор' })
  @Column({ type: DataType.INTEGER, autoIncrement: true, primaryKey: true })
  declare id: number;

  @ForeignKey(() => Product)
  @Column({ type: DataType.INTEGER, allowNull: false })
  declare product_id: number;

  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER, allowNull: false })
  declare user_id: number;

  @ApiProperty({ example: '5', description: 'Оценка' })
  @Column({ type: DataType.INTEGER, allowNull: false })
  declare rating: number;

  @ApiProperty({ example: 'Отличный товар!', description: 'Комментарий' })
  @Column({ type: DataType.TEXT, allowNull: false })
  declare comment: string;

  @ApiProperty({ example: false, description: 'Одобрен ли отзыв' })
  @Column({ type: DataType.BOOLEAN, defaultValue: false })
  declare is_approved: boolean;

  @BelongsTo(() => Product)
  product: Product;

  @BelongsTo(() => User)
  user: User;
}