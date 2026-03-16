import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { ProductImage } from './product-images.model';
import { CreateProductImageDto } from './dto/create-product-image.dto';
import { UpdateProductImageDto } from './dto/update-product-image.dto';
import { Product } from '../products/products.model';

@Injectable()
export class ProductImagesService {
  constructor(
    @InjectModel(ProductImage)
    private productImageModel: typeof ProductImage,
  ) {}

  async create(createProductImageDto: CreateProductImageDto): Promise<ProductImage> {
    const imageData = {
      product_id: createProductImageDto.product_id,
      image_url: createProductImageDto.image_url,
      is_primary: createProductImageDto.is_primary || false,
    };
    return this.productImageModel.create(imageData as any); 
  }

  async findAll(): Promise<ProductImage[]> {
    return this.productImageModel.findAll({
      include: [{ model: Product }],
    });
  }

  async findByProduct(productId: number): Promise<ProductImage[]> {
    return this.productImageModel.findAll({
      where: { product_id: productId },
    });
  }

  async findPrimary(productId: number): Promise<ProductImage | null> {
    return this.productImageModel.findOne({
      where: { product_id: productId, is_primary: true },
    });
  }

  async findOne(id: number): Promise<ProductImage> {
    const image = await this.productImageModel.findByPk(id, {
      include: [{ model: Product }],
    });

    if (!image) {
      throw new HttpException('Изображение не найдено', HttpStatus.NOT_FOUND);
    }

    return image;
  }

  async update(id: number, updateProductImageDto: UpdateProductImageDto): Promise<ProductImage> {
    const image = await this.findOne(id);
    await image.update(updateProductImageDto);
    return image;
  }

  async setPrimary(id: number): Promise<ProductImage> {
    const image = await this.findOne(id);

    await this.productImageModel.update(
      { is_primary: false },
      { where: { product_id: image.product_id } }
    );

    await image.update({ is_primary: true });

    return image;
  }

  async remove(id: number): Promise<void> {
    const image = await this.findOne(id);
    await image.destroy();
  }
}