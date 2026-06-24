import { Column, DataType, Model, Table, ForeignKey, BelongsTo, HasMany } from 'sequelize-typescript';
import { ApiProperty } from '@nestjs/swagger';
import { Product } from '../products/products.model';

@Table({ tableName: 'repositories', timestamps: true, createdAt: 'created_at', updatedAt: 'updated_at' })
export class Repository extends Model<Repository> {
  @ApiProperty({ example: '1', description: 'Уникальный идентификатор' })
  @Column({ type: DataType.INTEGER, autoIncrement: true, primaryKey: true })
  declare id: number;

  @ApiProperty({ example: 'Склад №1', description: 'Название склада' })
  @Column({ type: DataType.STRING, allowNull: false })
  declare name: string;

  @ApiProperty({ example: 'г. Москва, ул. Складская, д.1', description: 'Адрес склада' })
  @Column({ type: DataType.TEXT })
  declare address: string;

  @ApiProperty({ example: '+79001234567', description: 'Контактный телефон' })
  @Column({ type: DataType.STRING })
  declare phone: string;

  @ApiProperty({ example: true, description: 'Активен ли склад' })
  @Column({ type: DataType.BOOLEAN, defaultValue: true })
  declare is_active: boolean;

  @HasMany(() => RepositoryStock)
  stocks: RepositoryStock[];
}

@Table({ tableName: 'repository_stocks', timestamps: true, createdAt: 'created_at', updatedAt: 'updated_at' })
export class RepositoryStock extends Model<RepositoryStock> {
  @ApiProperty({ example: '1', description: 'Уникальный идентификатор' })
  @Column({ type: DataType.INTEGER, autoIncrement: true, primaryKey: true })
  declare id: number;

  @ForeignKey(() => Repository)
  @Column({ type: DataType.INTEGER, allowNull: false })
  declare repository_id: number;

  @ForeignKey(() => Product)
  @Column({ type: DataType.INTEGER, allowNull: false })
  declare product_id: number;

  @ApiProperty({ example: 100, description: 'Количество на складе' })
  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0 })
  declare quantity: number;

  @ApiProperty({ example: 10, description: 'Минимальный остаток для уведомления' })
  @Column({ type: DataType.INTEGER, defaultValue: 5 })
  declare min_stock: number;

  @ApiProperty({ example: 'A1-2', description: 'Местоположение на складе' })
  @Column({ type: DataType.STRING })
  declare location: string;

  @BelongsTo(() => Repository)
  repository: Repository;

  @BelongsTo(() => Product)
  product: Product;
}