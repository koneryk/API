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
    if (!createDto.discount_id) {
      throw new HttpException('discount_id обязателен', HttpStatus.BAD_REQUEST);
    }
    if (!createDto.product_id) {
      throw new HttpException('product_id обязателен', HttpStatus.BAD_REQUEST);
    }

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

  async findOne(discountId: DiscountProduct["discount_id"], productId: DiscountProduct["product_id"]): Promise<DiscountProduct> {
    if (!discountId || !productId) {
      throw new HttpException('discountId и productId обязательны', HttpStatus.BAD_REQUEST);
    }
    
    if (isNaN(discountId) || isNaN(productId)) {
      throw new HttpException('discountId и productId должны быть числами', HttpStatus.BAD_REQUEST);
    }

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
    if (!discountId || !productId) {
      throw new HttpException('discountId и productId обязательны', HttpStatus.BAD_REQUEST);
    }
    
    if (isNaN(discountId) || isNaN(productId)) {
      throw new HttpException('discountId и productId должны быть числами', HttpStatus.BAD_REQUEST);
    }

    const item = await this.findOne(discountId, productId);
    await item.destroy();
  }
}