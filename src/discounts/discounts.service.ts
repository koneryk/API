import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Discount } from './discounts.model';
import { CreateDiscountDto } from './dto/create-discount.dto';
import { UpdateDiscountDto } from './dto/update-discount.dto';
import { Product } from '../products/products.model';
import { Op } from 'sequelize';

@Injectable()
export class DiscountsService {
  constructor(
    @InjectModel(Discount)
    private discountModel: typeof Discount,
  ) {}

  async create(createDiscountDto: CreateDiscountDto): Promise<Discount> {
    const discountData = {
      code: createDiscountDto.code,
      name: createDiscountDto.name,
      type: createDiscountDto.type,
      value: createDiscountDto.value,
      min_order: createDiscountDto.min_order,
      start_date: createDiscountDto.start_date,
      end_date: createDiscountDto.end_date,
      is_active: createDiscountDto.is_active ?? true,
    };
    return this.discountModel.create(discountData as any); 
  }

  async findAll(): Promise<Discount[]> {
    return this.discountModel.findAll({
      include: [{ model: Product, through: { attributes: [] } }],
    });
  }

  async findActive(): Promise<Discount[]> {
    const now = new Date();
    return this.discountModel.findAll({
      where: {
        is_active: true,
        start_date: { [Op.lte]: now },
        end_date: { [Op.gte]: now },
      },
      include: [{ model: Product, through: { attributes: [] } }],
    });
  }

  async findOne(id: number): Promise<Discount> {
    const discount = await this.discountModel.findByPk(id, {
      include: [{ model: Product, through: { attributes: [] } }],
    });

    if (!discount) {
      throw new HttpException('Скидка не найдена', HttpStatus.NOT_FOUND);
    }

    return discount;
  }

  async findByCode(code: string): Promise<Discount> {
    const discount = await this.discountModel.findOne({
      where: { code },
      include: [{ model: Product, through: { attributes: [] } }],
    });

    if (!discount) {
      throw new HttpException('Скидка не найдена', HttpStatus.NOT_FOUND);
    }

    return discount;
  }

  async update(id: number, updateDiscountDto: UpdateDiscountDto): Promise<Discount> {
    const discount = await this.findOne(id);
    await discount.update(updateDiscountDto);
    return discount;
  }

  async remove(id: number): Promise<void> {
    const discount = await this.findOne(id);
    await discount.destroy();
  }
}