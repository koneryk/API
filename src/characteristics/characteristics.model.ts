import { Column, DataType, Model, Table, HasMany } from 'sequelize-typescript';
import { ApiProperty } from '@nestjs/swagger';
import { ProductCharacteristic } from '../products/product-characteristics.model';

@Table({ tableName: 'characteristics', timestamps: false })
export class Characteristic extends Model<Characteristic> {
  @ApiProperty({ example: '1', description: 'Уникальный идентификатор' })
  @Column({ type: DataType.INTEGER, autoIncrement: true, primaryKey: true })
  declare id: number;

  @ApiProperty({ example: 'Вес упаковки', description: 'Название характеристики' })
  @Column({ type: DataType.STRING, unique: true, allowNull: false })
  declare name: string;

  @ApiProperty({ example: 'number', description: 'Тип данных' })
  @Column({ type: DataType.STRING, allowNull: false })
  declare type: string;

  @HasMany(() => ProductCharacteristic)
  productCharacteristics: ProductCharacteristic[];
}