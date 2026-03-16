import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { OrderStatus } from './order-statuses.model';
import { OrderStatusesService } from './order-statuses.service';
import { CreateOrderStatusDto } from './dto/create-order-status.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles-auth.decorator';

@ApiTags('Статусы заказов')
@ApiBearerAuth()
@Controller('order-statuses')
export class OrderStatusesController {
  constructor(private readonly orderStatusesService: OrderStatusesService) {}

  @ApiOperation({ summary: 'Создание нового статуса заказа' })
  @ApiResponse({ status: 201, type: OrderStatus, description: 'Статус создан' })
  @Roles('ADMIN', 'MANAGER')
  @UseGuards(RolesGuard)
  @Post()
  create(@Body() createOrderStatusDto: CreateOrderStatusDto) {
    return this.orderStatusesService.create(createOrderStatusDto);
  }

  @ApiOperation({ summary: 'Получение всех статусов заказов' })
  @ApiResponse({ status: 200, type: [OrderStatus], description: 'Список статусов' })
  @Get()
  findAll() {
    return this.orderStatusesService.findAll();
  }

  @ApiOperation({ summary: 'Получение статуса по ID' })
  @ApiResponse({ status: 200, type: OrderStatus, description: 'Статус найден' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.orderStatusesService.findOne(+id);
  }

  @ApiOperation({ summary: 'Обновление статуса' })
  @ApiResponse({ status: 200, type: OrderStatus, description: 'Статус обновлен' })
  @Roles('ADMIN', 'MANAGER')
  @UseGuards(RolesGuard)
  @Put(':id')
  update(@Param('id') id: string, @Body() updateOrderStatusDto: UpdateOrderStatusDto) {
    return this.orderStatusesService.update(+id, updateOrderStatusDto);
  }

  @ApiOperation({ summary: 'Удаление статуса' })
  @ApiResponse({ status: 200, description: 'Статус удален' })
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.orderStatusesService.remove(+id);
  }
}