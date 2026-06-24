import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { RepositoryService } from './repository.service';
import { Repository, RepositoryStock } from './repository.model';
import { CreateRepositoryDto } from './dto/create-repository.dto';
import { UpdateRepositoryDto } from './dto/update-repository.dto';
import { CreateRepositoryStockDto } from './dto/create-repository-stock.dto';
import { UpdateRepositoryStockDto } from './dto/update-repository-stock.dto';
import { MoveStockDto } from './dto/move-stock.dto';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles-auth.decorator';

@ApiTags('Склад')
@ApiBearerAuth()
@Controller('repository')
export class RepositoryController {
  constructor(private readonly repositoryService: RepositoryService) {}

  @ApiOperation({ summary: 'Создание склада' })
  @ApiResponse({ status: 201, type: Repository, description: 'Склад создан' })
  @Roles('ADMIN', 'MANAGER')
  @UseGuards(RolesGuard)
  @Post()
  createRepository(@Body() createDto: CreateRepositoryDto) {
    return this.repositoryService.createRepository(createDto);
  }

  @ApiOperation({ summary: 'Получение всех складов' })
  @ApiResponse({ status: 200, type: [Repository], description: 'Список складов' })
  @Get()
  findAllRepositories() {
    return this.repositoryService.findAllRepositories();
  }

  @ApiOperation({ summary: 'Получение склада по ID' })
  @ApiResponse({ status: 200, type: Repository, description: 'Склад найден' })
  @Get(':id')
  findOneRepository(@Param('id') id: string) {
    return this.repositoryService.findOneRepository(+id);
  }

  @ApiOperation({ summary: 'Обновление склада' })
  @ApiResponse({ status: 200, type: Repository, description: 'Склад обновлен' })
  @Roles('ADMIN', 'MANAGER')
  @UseGuards(RolesGuard)
  @Put(':id')
  updateRepository(@Param('id') id: string, @Body() updateDto: UpdateRepositoryDto) {
    return this.repositoryService.updateRepository(+id, updateDto);
  }

  @ApiOperation({ summary: 'Удаление склада' })
  @ApiResponse({ status: 200, description: 'Склад удален' })
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  @Delete(':id')
  removeRepository(@Param('id') id: string) {
    return this.repositoryService.removeRepository(+id);
  }

  @ApiOperation({ summary: 'Создание остатка на складе' })
  @ApiResponse({ status: 201, type: RepositoryStock, description: 'Остаток создан' })
  @Roles('ADMIN', 'MANAGER')
  @UseGuards(RolesGuard)
  @Post('stocks')
  createStock(@Body() createDto: CreateRepositoryStockDto) {
    return this.repositoryService.createStock(createDto);
  }

  @ApiOperation({ summary: 'Получение всех остатков' })
  @ApiResponse({ status: 200, type: [RepositoryStock], description: 'Список остатков' })
  @Get('stocks')
  findAllStocks() {
    return this.repositoryService.findAllStocks();
  }

  @ApiOperation({ summary: 'Получение остатков по складу' })
  @ApiResponse({ status: 200, type: [RepositoryStock], description: 'Остатки на складе' })
  @Get('stocks/repository/:repositoryId')
  findStocksByRepository(@Param('repositoryId') repositoryId: string) {
    return this.repositoryService.findStocksByRepository(+repositoryId);
  }

  @ApiOperation({ summary: 'Получение остатков по товару' })
  @ApiResponse({ status: 200, type: [RepositoryStock], description: 'Остатки товара' })
  @Get('stocks/product/:productId')
  findStocksByProduct(@Param('productId') productId: string) {
    return this.repositoryService.findStocksByProduct(+productId);
  }

  @ApiOperation({ summary: 'Получение остатка по ID' })
  @ApiResponse({ status: 200, type: RepositoryStock, description: 'Остаток найден' })
  @Get('stocks/:id')
  findOneStock(@Param('id') id: string) {
    return this.repositoryService.findOneStock(+id);
  }

  @ApiOperation({ summary: 'Обновление остатка' })
  @ApiResponse({ status: 200, type: RepositoryStock, description: 'Остаток обновлен' })
  @Roles('ADMIN', 'MANAGER')
  @UseGuards(RolesGuard)
  @Put('stocks/:id')
  updateStock(@Param('id') id: string, @Body() updateDto: UpdateRepositoryStockDto) {
    return this.repositoryService.updateStock(+id, updateDto);
  }

  @ApiOperation({ summary: 'Удаление остатка' })
  @ApiResponse({ status: 200, description: 'Остаток удален' })
  @Roles('ADMIN', 'MANAGER')
  @UseGuards(RolesGuard)
  @Delete('stocks/:id')
  removeStock(@Param('id') id: string) {
    return this.repositoryService.removeStock(+id);
  }

  @ApiOperation({ summary: 'Перемещение товара между складами' })
  @ApiResponse({ status: 200, description: 'Товар перемещен' })
  @Roles('ADMIN', 'MANAGER')
  @UseGuards(RolesGuard)
  @Post('move')
  moveStock(@Body() moveDto: MoveStockDto) {
    return this.repositoryService.moveStock(moveDto);
  }

  @ApiOperation({ summary: 'Проверить наличие товара на складах' })
  @ApiResponse({ status: 200, description: 'Результат проверки' })
  @Get('check/:productId/:quantity')
  checkStock(
    @Param('productId') productId: string,
    @Param('quantity') quantity: string,
  ) {
    return this.repositoryService.checkStock(+productId, +quantity);
  }

  @ApiOperation({ summary: 'Получить товары с низким остатком' })
  @ApiResponse({ status: 200, type: [RepositoryStock], description: 'Товары с низким остатком' })
  @Get('low-stock')
  getLowStock() {
    return this.repositoryService.getLowStock();
  }

  @ApiOperation({ summary: 'Получить товары с низким остатком (с порогом)' })
  @ApiResponse({ status: 200, type: [RepositoryStock], description: 'Товары с низким остатком' })
  @Get('low-stock/:threshold')
  getLowStockWithThreshold(@Param('threshold') threshold: string) {
    return this.repositoryService.getLowStock(+threshold);
  }
}