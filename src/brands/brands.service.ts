import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Brand } from './brands.model';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { Product } from '../products/products.model';

@Injectable()
export class BrandsService {
  constructor(
    @InjectModel(Brand)
    private brandModel: typeof Brand,
  ) {}

  async create(createBrandDto: CreateBrandDto): Promise<Brand> {
    const brandData = {
      name: createBrandDto.name,
      description: createBrandDto.description,
      logo_url: createBrandDto.logo_url,
    };
    return this.brandModel.create(brandData as any);
  }

  async findAll(): Promise<Brand[]> {
    return this.brandModel.findAll({
      include: [{ model: Product }],
    });
  }

  async findOne(id: Brand["id"]): Promise<Brand> {
    const brand = await this.brandModel.findByPk(id, {
      include: [{ model: Product }],
    });

    if (!brand) {
      throw new HttpException('Бренд не найден', HttpStatus.NOT_FOUND);
    }

    return brand;
  }

  async update(id: Brand["id"], updateBrandDto: UpdateBrandDto): Promise<Brand> {
    const brand = await this.findOne(id);
    await brand.update(updateBrandDto);
    return brand;
  }

  async remove(id: Brand["id"]): Promise<void> {
    const brand = await this.findOne(id);
    await brand.destroy();
  }
}