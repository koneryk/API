import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Category } from './categories.model';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles-auth.decorator';

@ApiTags('Категории товаров')
@ApiBearerAuth()
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @ApiOperation({ summary: 'Создание новой категории' })
  @ApiResponse({ status: 201, type: Category, description: 'Категория создана' })
  @Roles('ADMIN', 'MANAGER')
  @UseGuards(RolesGuard)
  @Post()
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoriesService.create(createCategoryDto);
  }

  @ApiOperation({ summary: 'Получение всех категорий' })
  @ApiResponse({ status: 200, type: [Category], description: 'Список категорий' })
  @Get()
  findAll() {
    return this.categoriesService.findAll();
  }

  @ApiOperation({ summary: 'Получение корневых категорий' })
  @ApiResponse({ status: 200, type: [Category], description: 'Корневые категории' })
  @Get('root')
  findRoot() {
    return this.categoriesService.findRoot();
  }

  @ApiOperation({ summary: 'Получение подкатегорий' })
  @ApiResponse({ status: 200, type: [Category], description: 'Подкатегории' })
  @Get(':id/children')
  findChildren(@Param('id') id: string) {
    return this.categoriesService.findChildren(+id);
  }

  @ApiOperation({ summary: 'Получение категории по ID' })
  @ApiResponse({ status: 200, type: Category, description: 'Категория найдена' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.categoriesService.findOne(+id);
  }

  @ApiOperation({ summary: 'Обновление категории' })
  @ApiResponse({ status: 200, type: Category, description: 'Категория обновлена' })
  @Roles('ADMIN', 'MANAGER')
  @UseGuards(RolesGuard)
  @Put(':id')
  update(@Param('id') id: string, @Body() updateCategoryDto: UpdateCategoryDto) {
    return this.categoriesService.update(+id, updateCategoryDto);
  }

  @ApiOperation({ summary: 'Удаление категории' })
  @ApiResponse({ status: 200, description: 'Категория удалена' })
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.categoriesService.remove(+id);
  }
}