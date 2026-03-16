import { Injectable, HttpException, HttpStatus, Inject, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Product } from './products.model';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Category } from '../categories/categories.model';
import { Brand } from '../brands/brands.model';
import { ProductCharacteristic } from '../product-characteristics/product-characteristics.model';
import { Review } from '../reviews/reviews.model';
import { Discount } from '../discounts/discounts.model';
import { Characteristic } from '../characteristics/characteristics.model';
import { User } from '../users/users.model';
import { Op } from 'sequelize';
import { ProductImage } from "../product-images/product-images.model";
import { CreateProductImageDto } from 'src/product-images/dto/create-product-image.dto';
import { UpdateProductImageDto } from 'src/product-images/dto/update-product-image.dto';
import { UpdateProductCharacteristicDto } from 'src/product-characteristics/dto/update-product-characteristic.dto';
import { CreateProductCharacteristicDto } from 'src/product-characteristics/dto/create-product-characteristic.dto';
import { ProductCharacteristicsController } from 'src/product-characteristics/product-characteristics.controller';
import { ProductCharacteristicsModule } from 'src/product-characteristics/product-characteristics.module';

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
    return product;
  }

  async remove(id: number): Promise<void> {
    const product = await this.findOne(id);
    await product.destroy();
  }



  // Тут будет начинаться ProductImagesService




  
  async createproductImages(createProductImageDto: CreateProductImageDto): Promise<ProductImage> {
    const imageData = {
      product_id: createProductImageDto.product_id,
      image_url: createProductImageDto.image_url,
      is_primary: createProductImageDto.is_primary || false,
    };
    return this.productImageModel.create(imageData as any); 
  }

  async findAllproductImages(): Promise<ProductImage[]> {
    return this.productImageModel.findAll({
      include: [{ model: Product }],
    });
  }

  async findByProductproductImages(productId: number): Promise<ProductImage[]> {
    return this.productImageModel.findAll({
      where: { product_id: productId },
    });
  }

  async findPrimaryproductImages(productId: number): Promise<ProductImage | null> {
    return this.productImageModel.findOne({
      where: { product_id: productId, is_primary: true },
    });
  }

  async findOneproductImages(id: number): Promise<ProductImage> {
    const image = await this.productImageModel.findByPk(id, {
      include: [{ model: Product }],
    });

    if (!image) {
      throw new HttpException('Изображение не найдено', HttpStatus.NOT_FOUND);
    }

    return image;
  }

  async updateproductImages(id: number, updateProductImageDto: UpdateProductImageDto): Promise<ProductImage> {
    const image = await this.findOneproductImages(id);
    await image.update(updateProductImageDto);
    return image;
  }

  async setPrimaryproductImages(id: number): Promise<ProductImage> {
    const image = await this.findOneproductImages(id);

    await this.productImageModel.update(
      { is_primary: false },
      { where: { product_id: image.product_id } }
    );

    await image.update({ is_primary: true });

    return image;
  }

  async removeproductImages(id: number): Promise<void> {
    const image = await this.findOneproductImages(id);
    await image.destroy();
  }



  //Тут будет ProductsCharacteristictService





  async createproductCharacteristic(createDto: CreateProductCharacteristicDto): Promise<ProductCharacteristic> {
    const data = {
      product_id: createDto.product_id,
      characteristic_id: createDto.characteristic_id,
      value: createDto.value,
    };
    return this.productCharacteristicModel.create(data as any); // Добавлено as any
  }

  async findAllproductCharacteristic(): Promise<ProductCharacteristic[]> {
    return this.productCharacteristicModel.findAll({
      include: [
        { model: Product },
        { model: Characteristic },
      ],
    });
  }

  async findByProductproductCharacteristic(productId: number): Promise<ProductCharacteristic[]> {
    return this.productCharacteristicModel.findAll({
      where: { product_id: productId },
      include: [{ model: Characteristic }],
    });
  }

  async findOneproductCharacteristic(id: number): Promise<ProductCharacteristic> {
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

  async updateproductCharacteristic(id: number, updateDto: UpdateProductCharacteristicDto): Promise<ProductCharacteristic> {
    const item = await this.findOneproductCharacteristic(id);
    await item.update(updateDto);
    return item;
  }

  async removeproductCharacteristic(id: number): Promise<void> {
    const item = await this.findOneproductCharacteristic(id);
    await item.destroy();
  }




}