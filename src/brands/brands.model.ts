import { Column, DataType, Model, Table, HasMany } from 'sequelize-typescript';
import { ApiProperty } from '@nestjs/swagger';
import { Product } from '../products/products.model';

@Table({ tableName: 'brands', timestamps: false })
export class Brand extends Model<Brand> {
  @ApiProperty({ example: '1', description: 'Уникальный идентификатор' })
  @Column({ type: DataType.INTEGER, autoIncrement: true, primaryKey: true })
  declare id: number;

  @ApiProperty({ example: 'Royal Canin', description: 'Название бренда' })
  @Column({ type: DataType.STRING, unique: true, allowNull: false })
  declare name: string;

  @ApiProperty({ example: 'Производитель кормов...', description: 'Описание' })
  @Column({ type: DataType.TEXT })
  declare description: string;

  @ApiProperty({ example: 'https://example.com/logo.png', description: 'Логотип' })
  @Column({ type: DataType.STRING })
  declare logo_url: string;

  @HasMany(() => Product)
  products: Product[];
}