import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { DiscountProduct } from './discount-products.model';
import { CreateDiscountProductDto } from './dto/create-discount-product.dto';
import { Discount } from '../discounts/discounts.model';
import { Product } from '../products/products.model';

@Injectable()
export class DiscountProductsService {
  constructor(
    @InjectModel(DiscountProduct)
    private discountProductModel: typeof DiscountProduct,
  ) {}

  async create(createDto: CreateDiscountProductDto): Promise<DiscountProduct> {
    const existing = await this.discountProductModel.findOne({
      where: {
        discount_id: createDto.discount_id,
        product_id: createDto.product_id,
      },
    });

    if (existing) {
      throw new HttpException('Связь уже существует', HttpStatus.BAD_REQUEST);
    }

    const data = {
      discount_id: createDto.discount_id,
      product_id: createDto.product_id,
    };

    return this.discountProductModel.create(data as any); 
  }

  async findAll(): Promise<DiscountProduct[]> {
    return this.discountProductModel.findAll({
      include: [
        { model: Discount },
        { model: Product },
      ],
    });
  }

  async findOne(discountId: number, productId: number): Promise<DiscountProduct> {
    const item = await this.discountProductModel.findOne({
      where: {
        discount_id: discountId,
        product_id: productId,
      },
      include: [
        { model: Discount },
        { model: Product },
      ],
    });

    if (!item) {
      throw new HttpException('Связь не найдена', HttpStatus.NOT_FOUND);
    }

    return item;
  }

  async remove(discountId: number, productId: number): Promise<void> {
    const item = await this.findOne(discountId, productId);
    await item.destroy();
  }
}