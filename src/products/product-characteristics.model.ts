import { Column, DataType, Model, Table, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { ApiProperty } from '@nestjs/swagger';
import { Product } from '../products/products.model';
import { Characteristic } from '../characteristics/characteristics.model';

@Table({ tableName: 'product_characteristics', timestamps: false })
export class ProductCharacteristic extends Model<ProductCharacteristic> {
  @ApiProperty({ example: '1', description: 'Уникальный идентификатор' })
  @Column({ type: DataType.INTEGER, autoIncrement: true, primaryKey: true })
  declare id: number;

  @ForeignKey(() => Product)
  @Column({ type: DataType.INTEGER, allowNull: false })
  declare product_id: number;

  @ForeignKey(() => Characteristic)
  @Column({ type: DataType.INTEGER, allowNull: false })
  declare characteristic_id: number;

  @ApiProperty({ example: '2.5', description: 'Значение' })
  @Column({ type: DataType.STRING })
  declare value: string;

  @BelongsTo(() => Product)
  product: Product;

  @BelongsTo(() => Characteristic)
  characteristic: Characteristic;
}