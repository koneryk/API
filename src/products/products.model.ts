import { Column, DataType, Model, Table, ForeignKey, BelongsTo, HasMany, BelongsToMany } from 'sequelize-typescript';
import { ApiProperty } from '@nestjs/swagger';
import { Category } from '../categories/categories.model';
import { Brand } from '../brands/brands.model';
import { Review } from '../reviews/reviews.model';
import { DiscountProduct } from '../discount-products/discount-products.model';
import { Discount } from '../discounts/discounts.model';
import { OrderItem } from '../orders/order-items.model';
import { Characteristic } from 'src/characteristics/characteristics.model';

@Table({ tableName: 'products', timestamps: true, updatedAt: 'updated_at', createdAt: 'created_at' })
export class Product extends Model<Product> {
  @ApiProperty({ example: '1', description: 'Уникальный идентификатор' })
  @Column({ type: DataType.INTEGER, autoIncrement: true, primaryKey: true })
  declare id: number;

  @ApiProperty({ example: 'RC-12345', description: 'Артикул' })
  @Column({ type: DataType.STRING, unique: true, allowNull: false })
  declare sku: string;

  @ApiProperty({ example: 'Корм Royal Canin для щенков', description: 'Название' })
  @Column({ type: DataType.STRING, allowNull: false })
  declare name: string;

  @ForeignKey(() => Category)
  @Column({ type: DataType.INTEGER, allowNull: false })
  declare category_id: number;

  @ForeignKey(() => Brand)
  @Column({ type: DataType.INTEGER })
  declare brand_id: number;

  @ApiProperty({ example: '1500.00', description: 'Цена' })
  @Column({ type: DataType.DECIMAL(10,2), allowNull: false })
  declare price: number;

  @ApiProperty({ example: '50', description: 'Количество на складе' })
  @Column({ type: DataType.INTEGER, defaultValue: 0 })
  declare stock: number;

  @ApiProperty({ example: true, description: 'Активен ли товар' })
  @Column({ type: DataType.BOOLEAN, defaultValue: true })
  declare is_active: boolean;

  @ApiProperty({ example: 'Полное описание товара...', description: 'Описание' })
  @Column({ type: DataType.TEXT })
  declare description: string;

  @ApiProperty({ example: 'Мясо, злаки...', description: 'Состав' })
  @Column({ type: DataType.TEXT })
  declare ingredients: string;

  @BelongsTo(() => Category,{as: 'category'})
  category: Category;

  @BelongsTo(() => Brand)
  brand: Brand;

  @HasMany(() => ProductImage, {as: 'images'})
  images: ProductImage[];

  @HasMany(() => ProductCharacteristic)
  characteristics: ProductCharacteristic[];

  @HasMany(() => Review)
  reviews: Review[];

  @BelongsToMany(() => Discount, () => DiscountProduct)
  discounts: Discount[];

  @HasMany(() => OrderItem)
  orderItems: OrderItem[];
}
@Table({ tableName: 'product_images', timestamps: false })
class ProductImage extends Model<ProductImage> {
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
@Table({ tableName: 'product_characteristics', timestamps: false })
class ProductCharacteristic extends Model<ProductCharacteristic> {
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