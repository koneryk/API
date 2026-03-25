import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Product } from './products.model';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles-auth.decorator';
import { ProductImage } from './product-images.model';
import { UpdateProductImageDto } from './dto/update-product-image.dto';
import { CreateProductImageDto } from './dto/create-product-image.dto';
import { ProductCharacteristic } from './product-characteristics.model';
import { UpdateProductCharacteristicDto } from './dto/update-product-characteristic.dto';
import { CreateProductCharacteristicDto } from './dto/create-product-characteristic.dto';

@ApiTags('Товары')
@ApiBearerAuth()
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}


  @ApiOperation({ summary: 'Создание нового товара' })
  @ApiResponse({ status: 201, type: Product, description: 'Товар создан' })
  @Roles('ADMIN', 'MANAGER')
  @UseGuards(RolesGuard)
  @Post()
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @ApiOperation({ summary: 'Получение всех товаров' })
  @ApiResponse({ status: 200, type: [Product], description: 'Список товаров' })
  @Get()
  findAll() {
    return this.productsService.findAll();
  }

  @ApiOperation({ summary: 'Получение активных товаров' })
  @ApiResponse({ status: 200, type: [Product], description: 'Активные товары' })
  @Get('active')
  findActive() {
    return this.productsService.findActive();
  }

  @ApiOperation({ summary: 'Получение товаров по категории' })
  @ApiResponse({ status: 200, type: [Product], description: 'Товары категории' })
  @Get('by-category/:categoryId')
  findByCategory(@Param('categoryId') categoryId: string) {
    return this.productsService.findByCategory(+categoryId);
  }

  @ApiOperation({ summary: 'Получение товаров по бренду' })
  @ApiResponse({ status: 200, type: [Product], description: 'Товары бренда' })
  @Get('by-brand/:brandId')
  findByBrand(@Param('brandId') brandId: string) {
    return this.productsService.findByBrand(+brandId);
  }

  @ApiOperation({ summary: 'Поиск товаров' })
  @ApiResponse({ status: 200, type: [Product], description: 'Результаты поиска' })
  @Get('search')
  search(@Query('q') query: string) {
    return this.productsService.search(query);
  }

  @ApiOperation({ summary: 'Получение товара по ID' })
  @ApiResponse({ status: 200, type: Product, description: 'Товар найден' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(+id);
  }

  @ApiOperation({ summary: 'Получение товара по артикулу' })
  @ApiResponse({ status: 200, type: Product, description: 'Товар найден' })
  @Get('sku/:sku')
  findBySku(@Param('sku') sku: string) {
    return this.productsService.findBySku(sku);
  }

  @ApiOperation({ summary: 'Обновление товара' })
  @ApiResponse({ status: 200, type: Product, description: 'Товар обновлен' })
  @Roles('ADMIN', 'MANAGER')
  @UseGuards(RolesGuard)
  @Put(':id')
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.update(+id, updateProductDto);
  }

  @ApiOperation({ summary: 'Удаление товара' })
  @ApiResponse({ status: 200, description: 'Товар удален' })
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productsService.remove(+id);
  }


  @ApiOperation({ summary: 'Добавление изображения товару' })
  @ApiResponse({ status: 201, type: ProductImage, description: 'Изображение добавлено' })
  @Roles('ADMIN', 'MANAGER')
  @UseGuards(RolesGuard)
  @Post('images')
  createProductImage(@Body() createProductImageDto: CreateProductImageDto) {
    return this.productsService.createProductImage(createProductImageDto);
  }

  @ApiOperation({ summary: 'Получение всех изображений' })
  @ApiResponse({ status: 200, type: [ProductImage], description: 'Список изображений' })
  @Get('images')
  findAllProductImages() {
    return this.productsService.findAllProductImages();
  }

  @ApiOperation({ summary: 'Получение изображений товара' })
  @ApiResponse({ status: 200, type: [ProductImage], description: 'Изображения товара' })
  @Get('products/:productId/images')
  findByProductProductImages(@Param('productId') productId: string) {
    return this.productsService.findByProductProductImages(+productId);
  }

  @ApiOperation({ summary: 'Получение главного изображения товара' })
  @ApiResponse({ status: 200, type: ProductImage, description: 'Главное изображение' })
  @Get('products/:productId/images/primary')
  findPrimaryProductImage(@Param('productId') productId: string) {
    return this.productsService.findPrimaryProductImage(+productId);
  }

  @ApiOperation({ summary: 'Получение изображения по ID' })
  @ApiResponse({ status: 200, type: ProductImage, description: 'Изображение найдено' })
  @Get('images/:id')
  findOneProductImage(@Param('id') id: string) {
    return this.productsService.findOneProductImage(+id);
  }

  @ApiOperation({ summary: 'Обновление изображения' })
  @ApiResponse({ status: 200, type: ProductImage, description: 'Изображение обновлено' })
  @Roles('ADMIN', 'MANAGER')
  @UseGuards(RolesGuard)
  @Put('images/:id')
  updateProductImage(@Param('id') id: string, @Body() updateProductImageDto: UpdateProductImageDto) {
    return this.productsService.updateProductImage(+id, updateProductImageDto);
  }

  @ApiOperation({ summary: 'Установка изображения как главного' })
  @ApiResponse({ status: 200, type: ProductImage, description: 'Изображение установлено главным' })
  @Roles('ADMIN', 'MANAGER')
  @UseGuards(RolesGuard)
  @Put('images/:id/set-primary')
  setPrimaryProductImage(@Param('id') id: string) {
    return this.productsService.setPrimaryProductImage(+id);
  }

  @ApiOperation({ summary: 'Удаление изображения' })
  @ApiResponse({ status: 200, description: 'Изображение удалено' })
  @Roles('ADMIN', 'MANAGER')
  @UseGuards(RolesGuard)
  @Delete('images/:id')
  removeProductImage(@Param('id') id: string) {
    return this.productsService.removeProductImage(+id);
  }


  @ApiOperation({ summary: 'Добавление характеристики товару' })
  @ApiResponse({ status: 201, type: ProductCharacteristic, description: 'Характеристика добавлена' })
  @Roles('ADMIN', 'MANAGER')
  @UseGuards(RolesGuard)
  @Post('characteristics')
  createProductCharacteristic(@Body() createProductCharacteristicDto: CreateProductCharacteristicDto) {
    return this.productsService.createProductCharacteristic(createProductCharacteristicDto);
  }

  @ApiOperation({ summary: 'Получение всех значений характеристик' })
  @ApiResponse({ status: 200, type: [ProductCharacteristic], description: 'Список значений' })
  @Get('characteristics')
  findAllProductCharacteristics() {
    return this.productsService.findAllProductCharacteristics();
  }

  @ApiOperation({ summary: 'Получение характеристик товара' })
  @ApiResponse({ status: 200, type: [ProductCharacteristic], description: 'Характеристики товара' })
  @Get('products/:productId/characteristics')
  findByProductProductCharacteristics(@Param('productId') productId: string) {
    return this.productsService.findByProductProductCharacteristics(+productId);
  }

  @ApiOperation({ summary: 'Получение значения характеристики по ID' })
  @ApiResponse({ status: 200, type: ProductCharacteristic, description: 'Значение найдено' })
  @Get('characteristics/:id')
  findOneProductCharacteristic(@Param('id') id: string) {
    return this.productsService.findOneProductCharacteristic(+id);
  }

  @ApiOperation({ summary: 'Обновление значения характеристики' })
  @ApiResponse({ status: 200, type: ProductCharacteristic, description: 'Значение обновлено' })
  @Roles('ADMIN', 'MANAGER')
  @UseGuards(RolesGuard)
  @Put('characteristics/:id')
  updateProductCharacteristic(@Param('id') id: string, @Body() updateProductCharacteristicDto: UpdateProductCharacteristicDto) {
    return this.productsService.updateProductCharacteristic(+id, updateProductCharacteristicDto);
  }

  @ApiOperation({ summary: 'Удаление значения характеристики' })
  @ApiResponse({ status: 200, description: 'Значение удалено' })
  @Roles('ADMIN', 'MANAGER')
  @UseGuards(RolesGuard)
  @Delete('characteristics/:id')
  removeProductCharacteristic(@Param('id') id: string) {
    return this.productsService.removeProductCharacteristic(+id);
  }
}