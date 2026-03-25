import { Column, DataType, Model, Table, ForeignKey, BelongsTo, HasMany } from 'sequelize-typescript';
import { ApiProperty } from '@nestjs/swagger';
import { Product } from '../products/products.model';

@Table({ tableName: 'categories', timestamps: false })
export class Category extends Model<Category> {
  @ApiProperty({ example: '1', description: 'Уникальный идентификатор' })
  @Column({ type: DataType.INTEGER, autoIncrement: true, primaryKey: true })
  declare id: number;

  @ApiProperty({ example: 'Корма для собак', description: 'Название категории' })
  @Column({ type: DataType.STRING, allowNull: false })
  declare name: string;

  @ForeignKey(() => Category)
  @Column({ type: DataType.INTEGER })
  declare parent_id: number;

  @ApiProperty({ example: 'Все корма для собак...', description: 'Описание' })
  @Column({ type: DataType.TEXT })
  declare description: string;

  @ApiProperty({ example: 'https://example.com/cat.jpg', description: 'Изображение' })
  @Column({ type: DataType.STRING })
  declare image_url: string;

  @BelongsTo(() => Category)
  parent: Category;

  @HasMany(() => Category)
  children: Category[];

  @HasMany(() => Product)
  products: Product[];
}