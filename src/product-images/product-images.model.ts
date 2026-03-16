import { Column, DataType, Model, Table, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { ApiProperty } from '@nestjs/swagger';
import { Product } from '../products/products.model';

@Table({ tableName: 'product_images', timestamps: false })
export class ProductImage extends Model<ProductImage> {
  @ApiProperty({ example: '1', description: 'Уникальный идентификатор' })
  @Column({ type: DataType.INTEGER, autoIncrement: true, primaryKey: true })
  declare id: number;

  @ForeignKey(() => Product)
  @Column({ type: DataType.INTEGER, allowNull: false })
  declare product_id: number;

  @ApiProperty({ example: 'https://example.com/image.jpg', description: 'URL изображения' })
  @Column({ type: DataType.STRING, allowNull: false })
  declare image_url: string;

  @ApiProperty({ example: true, description: 'Главное изображение' })
  @Column({ type: DataType.BOOLEAN, defaultValue: false })
  declare is_primary: boolean;

  @BelongsTo(() => Product)
  product: Product;
}