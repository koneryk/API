import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Product } from './products.model';
import { ProductImage } from './product-images.model';
import { ProductCharacteristic } from './product-characteristics.model';
import { Category } from '../categories/categories.model';
import { Brand } from '../brands/brands.model';
import { Review } from '../reviews/reviews.model';
import { Discount } from '../discounts/discounts.model';
import { Characteristic } from '../characteristics/characteristics.model';
import { User } from '../users/users.model';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { CreateProductImageDto } from './dto/create-product-image.dto';
import { UpdateProductImageDto } from './dto/update-product-image.dto';
import { CreateProductCharacteristicDto } from './dto/create-product-characteristic.dto';
import { UpdateProductCharacteristicDto } from './dto/update-product-characteristic.dto';
import { Op } from 'sequelize';

@Injectable()
export class ProductsService {
  constructor(
      @InjectModel(Product)
      private productModel: typeof Product,
      @InjectModel(ProductImage)
      private productImageModel: typeof ProductImage,
      @InjectModel(ProductCharacteristic)
      private productCharacteristicModel: typeof ProductCharacteristic,
  ) {}


  async create(createProductDto: CreateProductDto): Promise<Product> {
    const productData = {
      sku: createProductDto.sku,
      name: createProductDto.name,
      category_id: createProductDto.category_id,
      brand_id: createProductDto.brand_id,
      price: createProductDto.price,
      stock: createProductDto.stock ?? 0,
      is_active: createProductDto.is_active ?? true,
      description: createProductDto.description,
      ingredients: createProductDto.ingredients,
    };
    return this.productModel.create(productData as any);
  }

  async findAll(): Promise<Product[]> {
    return this.productModel.findAll({
      include: [
        { model: Category },
        { model: Brand },
        { model: ProductImage },
        { model: Review },
      ],
    });
  }

  async findActive(): Promise<Product[]> {
    return this.productModel.findAll({
      where: { is_active: true },
      include: [
        { model: Category },
        { model: Brand },
        { model: ProductImage },
      ],
    });
  }

  async findByCategory(categoryId: number): Promise<Product[]> {
    return this.productModel.findAll({
      where: { category_id: categoryId, is_active: true },
      include: [
        { model: Brand },
        { model: ProductImage },
      ],
    });
  }

  async findByBrand(brandId: number): Promise<Product[]> {
    return this.productModel.findAll({
      where: { brand_id: brandId, is_active: true },
      include: [
        { model: Category },
        { model: ProductImage },
      ],
    });
  }

  async search(query: string): Promise<Product[]> {
    return this.productModel.findAll({
      where: {
        [Op.or]: [
          { name: { [Op.iLike]: `%${query}%` } },
          { description: { [Op.iLike]: `%${query}%` } },
          { sku: { [Op.iLike]: `%${query}%` } },
        ],
        is_active: true,
      },
      include: [
        { model: Category },
        { model: Brand },
        { model: ProductImage },
      ],
    });
  }

  async findOne(id: number): Promise<Product> {
    const product = await this.productModel.findByPk(id, {
      include: [
        { model: Category },
        { model: Brand },
        { model: ProductImage },
        {
          model: ProductCharacteristic,
          include: [{ model: Characteristic }]
        },
        {
          model: Review,
          include: [{ model: User }],
          where: { is_approved: true },
          required: false
        },
        { model: Discount, through: { attributes: [] } },
      ],
    });

    if (!product) {
      throw new HttpException('Товар не найден', HttpStatus.NOT_FOUND);
    }

    return product;
  }

  async findBySku(sku: string): Promise<Product> {
    const product = await this.productModel.findOne({
      where: { sku },
      include: [
        { model: Category },
        { model: Brand },
        { model: ProductImage },
      ],
    });

    if (!product) {
      throw new HttpException('Товар не найден', HttpStatus.NOT_FOUND);
    }

    return product;
  }

  async update(id: number, updateProductDto: UpdateProductDto): Promise<Product> {
    const product = await this.findOne(id);
    await product.update(updateProductDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const product = await this.findOne(id);
    await product.destroy();
  }


  async createProductImage(createProductImageDto: CreateProductImageDto): Promise<ProductImage> {
    const product = await this.productModel.findByPk(createProductImageDto.product_id);
    if (!product) {
      throw new HttpException('Товар не найден', HttpStatus.NOT_FOUND);
    }

    const isPrimary = createProductImageDto.is_primary || false;

    if (isPrimary) {
      await this.productImageModel.update(
          { is_primary: false },
          { where: { product_id: createProductImageDto.product_id } }
      );
    }

    const imageData = {
      product_id: createProductImageDto.product_id,
      image_url: createProductImageDto.image_url,
      is_primary: isPrimary,
    };

    return this.productImageModel.create(imageData as any);
  }

  async findAllProductImages(): Promise<ProductImage[]> {
    return this.productImageModel.findAll({
      include: [{ model: Product }],
    });
  }

  async findByProductProductImages(productId: number): Promise<ProductImage[]> {
    const product = await this.productModel.findByPk(productId);
    if (!product) {
      throw new HttpException('Товар не найден', HttpStatus.NOT_FOUND);
    }

    return this.productImageModel.findAll({
      where: { product_id: productId },
    });
  }

  async findPrimaryProductImage(productId: number): Promise<ProductImage | null> {
    return this.productImageModel.findOne({
      where: { product_id: productId, is_primary: true },
    });
  }

  async findOneProductImage(id: number): Promise<ProductImage> {
    const image = await this.productImageModel.findByPk(id, {
      include: [{ model: Product }],
    });

    if (!image) {
      throw new HttpException('Изображение не найдено', HttpStatus.NOT_FOUND);
    }

    return image;
  }

  async updateProductImage(id: number, updateProductImageDto: UpdateProductImageDto): Promise<ProductImage> {
    const image = await this.findOneProductImage(id);
    await image.update(updateProductImageDto);
    return this.findOneProductImage(id);
  }

  async setPrimaryProductImage(id: number): Promise<ProductImage> {
    const image = await this.findOneProductImage(id);

    await this.productImageModel.update(
        { is_primary: false },
        { where: { product_id: image.product_id } }
    );

    await image.update({ is_primary: true });

    return this.findOneProductImage(id);
  }

  async removeProductImage(id: number): Promise<void> {
    const image = await this.findOneProductImage(id);
    await image.destroy();
  }


  async createProductCharacteristic(createDto: CreateProductCharacteristicDto): Promise<ProductCharacteristic> {
    const product = await this.productModel.findByPk(createDto.product_id);
    if (!product) {
      throw new HttpException('Товар не найден', HttpStatus.NOT_FOUND);
    }

    const data = {
      product_id: createDto.product_id,
      characteristic_id: createDto.characteristic_id,
      value: createDto.value,
    };

    return this.productCharacteristicModel.create(data as any);
  }

  async findAllProductCharacteristics(): Promise<ProductCharacteristic[]> {
    return this.productCharacteristicModel.findAll({
      include: [
        { model: Product },
        { model: Characteristic },
      ],
    });
  }

  async findByProductProductCharacteristics(productId: number): Promise<ProductCharacteristic[]> {
    const product = await this.productModel.findByPk(productId);
    if (!product) {
      throw new HttpException('Товар не найден', HttpStatus.NOT_FOUND);
    }

    return this.productCharacteristicModel.findAll({
      where: { product_id: productId },
      include: [{ model: Characteristic }],
    });
  }

  async findOneProductCharacteristic(id: number): Promise<ProductCharacteristic> {
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

  async updateProductCharacteristic(
      id: number,
      updateDto: UpdateProductCharacteristicDto
  ): Promise<ProductCharacteristic> {
    const item = await this.findOneProductCharacteristic(id);
    await item.update(updateDto);
    return this.findOneProductCharacteristic(id);
  }

  async removeProductCharacteristic(id: number): Promise<void> {
    const item = await this.findOneProductCharacteristic(id);
    await item.destroy();
  }
}