import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { OrderItem } from './order-items.model';
import { OrderItemsService } from './order-items.service';
import { CreateOrderItemDto } from './dto/create-order-item.dto';
import { UpdateOrderItemDto } from './dto/update-order-item.dto';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles-auth.decorator';

@ApiTags('Позиции заказов')
@ApiBearerAuth()
@Controller('order-items')
export class OrderItemsController {
  constructor(private readonly orderItemsService: OrderItemsService) {}

  @ApiOperation({ summary: 'Добавление позиции в заказ' })
  @ApiResponse({ status: 201, type: OrderItem, description: 'Позиция добавлена' })
  @Post()
  create(@Body() createOrderItemDto: CreateOrderItemDto) {
    return this.orderItemsService.create(createOrderItemDto);
  }

  @ApiOperation({ summary: 'Получение всех позиций заказа' })
  @ApiResponse({ status: 200, type: [OrderItem], description: 'Список позиций' })
  @Roles('ADMIN', 'MANAGER')
  @UseGuards(RolesGuard)
  @Get()
  findAll() {
    return this.orderItemsService.findAll();
  }

  @ApiOperation({ summary: 'Получение позиций по заказу' })
  @ApiResponse({ status: 200, type: [OrderItem], description: 'Позиции заказа' })
  @Get('by-order/:orderId')
  findByOrder(@Param('orderId') orderId: string) {
    return this.orderItemsService.findByOrder(+orderId);
  }

  @ApiOperation({ summary: 'Получение позиции по ID' })
  @ApiResponse({ status: 200, type: OrderItem, description: 'Позиция найдена' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.orderItemsService.findOne(+id);
  }

  @ApiOperation({ summary: 'Обновление позиции' })
  @ApiResponse({ status: 200, type: OrderItem, description: 'Позиция обновлена' })
  @Put(':id')
  update(@Param('id') id: string, @Body() updateOrderItemDto: UpdateOrderItemDto) {
    return this.orderItemsService.update(+id, updateOrderItemDto);
  }

  @ApiOperation({ summary: 'Удаление позиции' })
  @ApiResponse({ status: 200, description: 'Позиция удалена' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.orderItemsService.remove(+id);
  }
}