import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ProductCharacteristic } from './product-characteristics.model';
import { ProductCharacteristicsService } from './product-characteristics.service';
import { CreateProductCharacteristicDto } from './dto/create-product-characteristic.dto';
import { UpdateProductCharacteristicDto } from './dto/update-product-characteristic.dto';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles-auth.decorator';

@ApiTags('Характеристики товаров (значения)')
@ApiBearerAuth()
@Controller('product-characteristics')
export class ProductCharacteristicsController {
  constructor(private readonly productCharacteristicsService: ProductCharacteristicsService) {}

  @ApiOperation({ summary: 'Добавление характеристики товару' })
  @ApiResponse({ status: 201, type: ProductCharacteristic, description: 'Характеристика добавлена' })
  @Roles('ADMIN', 'MANAGER')
  @UseGuards(RolesGuard)
  @Post()
  create(@Body() createProductCharacteristicDto: CreateProductCharacteristicDto) {
    return this.productCharacteristicsService.create(createProductCharacteristicDto);
  }

  @ApiOperation({ summary: 'Получение всех значений характеристик' })
  @ApiResponse({ status: 200, type: [ProductCharacteristic], description: 'Список значений' })
  @Get()
  findAll() {
    return this.productCharacteristicsService.findAll();
  }

  @ApiOperation({ summary: 'Получение характеристик товара' })
  @ApiResponse({ status: 200, type: [ProductCharacteristic], description: 'Характеристики товара' })
  @Get('by-product/:productId')
  findByProduct(@Param('productId') productId: string) {
    return this.productCharacteristicsService.findByProduct(+productId);
  }

  @ApiOperation({ summary: 'Получение значения характеристики по ID' })
  @ApiResponse({ status: 200, type: ProductCharacteristic, description: 'Значение найдено' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productCharacteristicsService.findOne(+id);
  }

  @ApiOperation({ summary: 'Обновление значения характеристики' })
  @ApiResponse({ status: 200, type: ProductCharacteristic, description: 'Значение обновлено' })
  @Roles('ADMIN', 'MANAGER')
  @UseGuards(RolesGuard)
  @Put(':id')
  update(@Param('id') id: string, @Body() updateProductCharacteristicDto: UpdateProductCharacteristicDto) {
    return this.productCharacteristicsService.update(+id, updateProductCharacteristicDto);
  }

  @ApiOperation({ summary: 'Удаление значения характеристики' })
  @ApiResponse({ status: 200, description: 'Значение удалено' })
  @Roles('ADMIN', 'MANAGER')
  @UseGuards(RolesGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productCharacteristicsService.remove(+id);
  }
}