import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ProductImage } from './product-images.model';
import { ProductImagesService } from './product-images.service';
import { CreateProductImageDto } from './dto/create-product-image.dto';
import { UpdateProductImageDto } from './dto/update-product-image.dto';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles-auth.decorator';

@ApiTags('Изображения товаров')
@ApiBearerAuth()
@Controller('product-images')
export class ProductImagesController {
  constructor(private readonly productImagesService: ProductImagesService) {}

  @ApiOperation({ summary: 'Добавление изображения товару' })
  @ApiResponse({ status: 201, type: ProductImage, description: 'Изображение добавлено' })
  @Roles('ADMIN', 'MANAGER')
  @UseGuards(RolesGuard)
  @Post()
  create(@Body() createProductImageDto: CreateProductImageDto) {
    return this.productImagesService.create(createProductImageDto);
  }

  @ApiOperation({ summary: 'Получение всех изображений' })
  @ApiResponse({ status: 200, type: [ProductImage], description: 'Список изображений' })
  @Get()
  findAll() {
    return this.productImagesService.findAll();
  }

  @ApiOperation({ summary: 'Получение изображений товара' })
  @ApiResponse({ status: 200, type: [ProductImage], description: 'Изображения товара' })
  @Get('by-product/:productId')
  findByProduct(@Param('productId') productId: string) {
    return this.productImagesService.findByProduct(+productId);
  }

  @ApiOperation({ summary: 'Получение главного изображения товара' })
  @ApiResponse({ status: 200, type: ProductImage, description: 'Главное изображение' })
  @Get('by-product/:productId/primary')
  findPrimary(@Param('productId') productId: string) {
    return this.productImagesService.findPrimary(+productId);
  }

  @ApiOperation({ summary: 'Получение изображения по ID' })
  @ApiResponse({ status: 200, type: ProductImage, description: 'Изображение найдено' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productImagesService.findOne(+id);
  }

  @ApiOperation({ summary: 'Обновление изображения' })
  @ApiResponse({ status: 200, type: ProductImage, description: 'Изображение обновлено' })
  @Roles('ADMIN', 'MANAGER')
  @UseGuards(RolesGuard)
  @Put(':id')
  update(@Param('id') id: string, @Body() updateProductImageDto: UpdateProductImageDto) {
    return this.productImagesService.update(+id, updateProductImageDto);
  }

  @ApiOperation({ summary: 'Установка изображения как главного' })
  @ApiResponse({ status: 200, type: ProductImage, description: 'Изображение установлено главным' })
  @Roles('ADMIN', 'MANAGER')
  @UseGuards(RolesGuard)
  @Put(':id/set-primary')
  setPrimary(@Param('id') id: string) {
    return this.productImagesService.setPrimary(+id);
  }

  @ApiOperation({ summary: 'Удаление изображения' })
  @ApiResponse({ status: 200, description: 'Изображение удалено' })
  @Roles('ADMIN', 'MANAGER')
  @UseGuards(RolesGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productImagesService.remove(+id);
  }
}