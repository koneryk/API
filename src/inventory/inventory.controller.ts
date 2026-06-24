import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { InventoryService } from './inventory.service';
import { ProductInventory } from './inventory.model';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles-auth.decorator';

@ApiTags('Инвентаризация')
@ApiBearerAuth()
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @ApiOperation({ summary: 'Получить остаток товара' })
  @ApiResponse({ status: 200, type: ProductInventory, description: 'Остаток товара' })
  @Get('product/:productId')
  async getProductStock(@Param('productId') productId: string) {
    return this.inventoryService.getProductStock(parseInt(productId, 10));
  }

  @ApiOperation({ summary: 'Создать инвентаризацию для товара' })
  @ApiResponse({ status: 201, type: ProductInventory, description: 'Инвентаризация создана' })
  @Roles('ADMIN', 'MANAGER')
  @UseGuards(RolesGuard)
  @Post('product/:productId')
  async createInventory(
    @Param('productId') productId: string,
    @Body('quantity') quantity: number,
    @Body('minStock') minStock: number,
  ) {
    return this.inventoryService.createInventory(
      parseInt(productId, 10),
      quantity || 0,
      minStock || 5,
    );
  }

  @ApiOperation({ summary: 'Обновить количество товара' })
  @ApiResponse({ status: 200, type: ProductInventory, description: 'Количество обновлено' })
  @Roles('ADMIN', 'MANAGER')
  @UseGuards(RolesGuard)
  @Put('product/:productId')
  async updateStock(
    @Param('productId') productId: string,
    @Body('quantity') quantity: number,
  ) {
    return this.inventoryService.updateStock(parseInt(productId, 10), quantity);
  }

  @ApiOperation({ summary: 'Добавить количество товара' })
  @ApiResponse({ status: 200, type: ProductInventory, description: 'Количество добавлено' })
  @Roles('ADMIN', 'MANAGER')
  @UseGuards(RolesGuard)
  @Post('product/:productId/add')
  async addStock(
    @Param('productId') productId: string,
    @Body('quantity') quantity: number,
  ) {
    return this.inventoryService.addStock(parseInt(productId, 10), quantity);
  }

  @ApiOperation({ summary: 'Уменьшить количество товара (резерв)' })
  @ApiResponse({ status: 200, type: ProductInventory, description: 'Количество уменьшено' })
  @Roles('ADMIN', 'MANAGER')
  @UseGuards(RolesGuard)
  @Post('product/:productId/reduce')
  async reduceStock(
    @Param('productId') productId: string,
    @Body('quantity') quantity: number,
  ) {
    return this.inventoryService.reduceStock(parseInt(productId, 10), quantity);
  }

  @ApiOperation({ summary: 'Проверить наличие товара' })
  @ApiResponse({ status: 200, description: 'Результат проверки' })
  @Get('check/:productId')
  async checkAvailability(
    @Param('productId') productId: string,
    @Query('quantity') quantity: string,
  ) {
    return this.inventoryService.checkAvailability(
      parseInt(productId, 10),
      parseInt(quantity, 10) || 1,
    );
  }

  @ApiOperation({ summary: 'Получить товары с низким остатком' })
  @ApiResponse({ status: 200, type: [ProductInventory], description: 'Товары с низким остатком' })
  @Get('low-stock')
  async getLowStock() {
    return this.inventoryService.getLowStock();
  }

  @ApiOperation({ summary: 'Получить всю инвентаризацию' })
  @ApiResponse({ status: 200, type: [ProductInventory], description: 'Вся инвентаризация' })
  @Get()
  async getAllInventory() {
    return this.inventoryService.getAllInventory();
  }
}