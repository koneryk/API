import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { ProductCharacteristic } from './product-characteristics.model';
import { CreateProductCharacteristicDto } from './dto/create-product-characteristic.dto';
import { UpdateProductCharacteristicDto } from './dto/update-product-characteristic.dto';
import { Product } from '../products/products.model';
import { Characteristic } from '../characteristics/characteristics.model';

@Injectable()
export class ProductCharacteristicsService {
  constructor(
    @InjectModel(ProductCharacteristic)
    private productCharacteristicModel: typeof ProductCharacteristic,
  ) {}

  async create(createDto: CreateProductCharacteristicDto): Promise<ProductCharacteristic> {
    const data = {
      product_id: createDto.product_id,
      characteristic_id: createDto.characteristic_id,
      value: createDto.value,
    };
    return this.productCharacteristicModel.create(data as any); 
  }

  async findAll(): Promise<ProductCharacteristic[]> {
    return this.productCharacteristicModel.findAll({
      include: [
        { model: Product },
        { model: Characteristic },
      ],
    });
  }

  async findByProduct(productId: number): Promise<ProductCharacteristic[]> {
    return this.productCharacteristicModel.findAll({
      where: { product_id: productId },
      include: [{ model: Characteristic }],
    });
  }

  async findOne(id: number): Promise<ProductCharacteristic> {
    const item = await this.productCharacteristicModel.findByPk(id, {
      include: [
        { model: Product },
        { model: Characteristic },
      ],
    });

    if (!item) {
      throw new HttpException('Характеристика товара не найдена', HttpStatus.NOT_FOUND);
    }

    return item;
  }

  async update(id: number, updateDto: UpdateProductCharacteristicDto): Promise<ProductCharacteristic> {
    const item = await this.findOne(id);
    await item.update(updateDto);
    return item;
  }

  async remove(id: number): Promise<void> {
    const item = await this.findOne(id);
    await item.destroy();
  }
}