import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Discount } from './discounts.model';
import { DiscountsService } from './discounts.service';
import { CreateDiscountDto } from './dto/create-discount.dto';
import { UpdateDiscountDto } from './dto/update-discount.dto';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles-auth.decorator';

@ApiTags('Скидки')
@ApiBearerAuth()
@Controller('discounts')
export class DiscountsController {
  constructor(private readonly discountsService: DiscountsService) {}

  @ApiOperation({ summary: 'Создание новой скидки' })
  @ApiResponse({ status: 201, type: Discount, description: 'Скидка создана' })
  @Roles('ADMIN', 'MANAGER')
  @UseGuards(RolesGuard)
  @Post()
  create(@Body() createDiscountDto: CreateDiscountDto) {
    return this.discountsService.create(createDiscountDto);
  }

  @ApiOperation({ summary: 'Получение всех скидок' })
  @ApiResponse({ status: 200, type: [Discount], description: 'Список скидок' })
  @Get()
  findAll() {
    return this.discountsService.findAll();
  }

  @ApiOperation({ summary: 'Получение активных скидок' })
  @ApiResponse({ status: 200, type: [Discount], description: 'Список активных скидок' })
  @Get('active')
  findActive() {
    return this.discountsService.findActive();
  }

  @ApiOperation({ summary: 'Получение скидки по ID' })
  @ApiResponse({ status: 200, type: Discount, description: 'Скидка найдена' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.discountsService.findOne(+id);
  }

  @ApiOperation({ summary: 'Получение скидки по коду' })
  @ApiResponse({ status: 200, type: Discount, description: 'Скидка найдена' })
  @Get('code/:code')
  findByCode(@Param('code') code: string) {
    return this.discountsService.findByCode(code);
  }

  @ApiOperation({ summary: 'Обновление скидки' })
  @ApiResponse({ status: 200, type: Discount, description: 'Скидка обновлена' })
  @Roles('ADMIN', 'MANAGER')
  @UseGuards(RolesGuard)
  @Put(':id')
  update(@Param('id') id: string, @Body() updateDiscountDto: UpdateDiscountDto) {
    return this.discountsService.update(+id, updateDiscountDto);
  }

  @ApiOperation({ summary: 'Удаление скидки' })
  @ApiResponse({ status: 200, description: 'Скидка удалена' })
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.discountsService.remove(+id);
  }
}