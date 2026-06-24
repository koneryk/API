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
  if (!createDiscountDto.start_date) {
    throw new HttpException('Дата начала скидки обязательна', HttpStatus.BAD_REQUEST);
  }
  if (!createDiscountDto.end_date) {
    throw new HttpException('Дата окончания скидки обязательна', HttpStatus.BAD_REQUEST);
  }

  const existing = await this.discountModel.findOne({
    where: { code: createDiscountDto.code },
  });
  if (existing) {
    throw new HttpException('Скидка с таким кодом уже существует', HttpStatus.BAD_REQUEST);
  }

  const discountData = {
    code: createDiscountDto.code,
    name: createDiscountDto.name,
    type: createDiscountDto.type,
    value: createDiscountDto.value,
    min_order: createDiscountDto.min_order || 0,
    start_date: new Date(createDiscountDto.start_date),
    end_date: new Date(createDiscountDto.end_date),
    is_active: createDiscountDto.is_active !== undefined ? createDiscountDto.is_active : true,
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

  async findOne(id: Discount["id"]): Promise<Discount> {
    const discount = await this.discountModel.findByPk(id, {
      include: [{ model: Product, through: { attributes: [] } }],
    });

    if (!discount) {
      throw new HttpException('Скидка не найдена', HttpStatus.NOT_FOUND);
    }

    return discount;
  }

  async findByCode(code: Discount["code"]): Promise<Discount> {
    const discount = await this.discountModel.findOne({
      where: { code },
      include: [{ model: Product, through: { attributes: [] } }],
    });

    if (!discount) {
      throw new HttpException('Скидка не найдена', HttpStatus.NOT_FOUND);
    }

    return discount;
  }

  async update(id: Discount["id"], updateDiscountDto: UpdateDiscountDto): Promise<Discount> {
    const discount = await this.findOne(id);
    await discount.update(updateDiscountDto);
    return discount;
  }

  async remove(id: Discount["id"]): Promise<void> {
    const discount = await this.findOne(id);
    await discount.destroy();
  }
}