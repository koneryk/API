import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Brand } from './brands.model';
import { BrandsService } from './brands.service';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles-auth.decorator';

@ApiTags('Бренды')
@ApiBearerAuth()
@Controller('brands')
export class BrandsController {
  constructor(private readonly brandsService: BrandsService) {}

  @ApiOperation({ summary: 'Создание нового бренда' })
  @ApiResponse({ status: 201, type: Brand, description: 'Бренд создан' })
  @Roles('ADMIN', 'MANAGER')
  @UseGuards(RolesGuard)
  @Post()
  create(@Body() createBrandDto: CreateBrandDto) {
    return this.brandsService.create(createBrandDto);
  }

  @ApiOperation({ summary: 'Получение всех брендов' })
  @ApiResponse({ status: 200, type: [Brand], description: 'Список брендов' })
  @Get()
  findAll() {
    return this.brandsService.findAll();
  }

  @ApiOperation({ summary: 'Получение бренда по ID' })
  @ApiResponse({ status: 200, type: Brand, description: 'Бренд найден' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.brandsService.findOne(+id);
  }

  @ApiOperation({ summary: 'Обновление бренда' })
  @ApiResponse({ status: 200, type: Brand, description: 'Бренд обновлен' })
  @Roles('ADMIN', 'MANAGER')
  @UseGuards(RolesGuard)
  @Put(':id')
  update(@Param('id') id: string, @Body() updateBrandDto: UpdateBrandDto) {
    return this.brandsService.update(+id, updateBrandDto);
  }

  @ApiOperation({ summary: 'Удаление бренда' })
  @ApiResponse({ status: 200, description: 'Бренд удален' })
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.brandsService.remove(+id);
  }
}