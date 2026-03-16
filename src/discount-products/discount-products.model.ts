import { Column, DataType, Model, Table, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Discount } from '../discounts/discounts.model';
import { Product } from '../products/products.model';

@Table({ tableName: 'discount_products', timestamps: false })
export class DiscountProduct extends Model<DiscountProduct> {
  @ForeignKey(() => Discount)
  @Column({ type: DataType.INTEGER, allowNull: false, primaryKey: true })
  declare discount_id: number;

  @ForeignKey(() => Product)
  @Column({ type: DataType.INTEGER, allowNull: false, primaryKey: true })
  declare product_id: number;

  @BelongsTo(() => Discount)
  discount: Discount;

  @BelongsTo(() => Product)
  product: Product;
}