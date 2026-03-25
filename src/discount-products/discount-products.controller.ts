import { Controller, Get, Post, Body, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DiscountProductsService } from './discount-products.service';
import { CreateDiscountProductDto } from './dto/create-discount-product.dto';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles-auth.decorator';

@ApiTags('Скидки-товары')
@ApiBearerAuth()
@Controller('discount-products')
export class DiscountProductsController {
  constructor(private readonly discountProductsService: DiscountProductsService) {}

  @ApiOperation({ summary: 'Привязать скидку к товару' })
  @Roles('ADMIN', 'MANAGER')
  @UseGuards(RolesGuard)
  @Post()
  create(@Body() createDto: CreateDiscountProductDto) {
    return this.discountProductsService.create(createDto);
  }

  @ApiOperation({ summary: 'Получить все связи' })
  @Get()
  findAll() {
    return this.discountProductsService.findAll();
  }

  @ApiOperation({ summary: 'Удалить связь' })
  @Roles('ADMIN', 'MANAGER')
  @UseGuards(RolesGuard)
  @Delete(':discountId/:productId')
  remove(@Param('discountId') discountId: string, @Param('productId') productId: string) {
    return this.discountProductsService.remove(+discountId, +productId);
  }
}