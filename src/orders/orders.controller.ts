import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, Query, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Order } from './orders.model';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles-auth.decorator';

@ApiTags('Заказы')
@ApiBearerAuth()
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @ApiOperation({ summary: 'Создание нового заказа' })
  @ApiResponse({ status: 201, type: Order, description: 'Заказ создан' })
  @Post()
  create(@Body() createOrderDto: CreateOrderDto, @Req() req) {
    const userId = req.user.id;
    return this.ordersService.create(createOrderDto, userId);
  }

  @ApiOperation({ summary: 'Получение всех заказов пользователя' })
  @ApiResponse({ status: 200, type: [Order], description: 'Список заказов' })
  @Get('my')
  findMyOrders(@Req() req) {
    const userId = req.user.id;
    return this.ordersService.findByUser(userId);
  }

  @ApiOperation({ summary: 'Получение всех заказов' })
  @ApiResponse({ status: 200, type: [Order], description: 'Список всех заказов' })
  @Roles('ADMIN', 'MANAGER')
  @UseGuards(RolesGuard)
  @Get()
  findAll() {
    return this.ordersService.findAll();
  }

  @ApiOperation({ summary: 'Получение заказов по пользователю' })
  @ApiResponse({ status: 200, type: [Order], description: 'Заказы пользователя' })
  @Roles('ADMIN', 'MANAGER')
  @UseGuards(RolesGuard)
  @Get('user/:userId')
  findByUser(@Param('userId') userId: string) {
    return this.ordersService.findByUser(+userId);
  }

  @ApiOperation({ summary: 'Получение заказов по статусу' })
  @ApiResponse({ status: 200, type: [Order], description: 'Заказы по статусу' })
  @Roles('ADMIN', 'MANAGER')
  @UseGuards(RolesGuard)
  @Get('status/:statusId')
  findByStatus(@Param('statusId') statusId: string) {
    return this.ordersService.findByStatus(+statusId);
  }

  @ApiOperation({ summary: 'Получение заказа по ID' })
  @ApiResponse({ status: 200, type: Order, description: 'Заказ найден' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(+id);
  }

  @ApiOperation({ summary: 'Получение заказа по номеру' })
  @ApiResponse({ status: 200, type: Order, description: 'Заказ найден' })
  @Get('number/:orderNumber')
  findByOrderNumber(@Param('orderNumber') orderNumber: string) {
    return this.ordersService.findByOrderNumber(orderNumber);
  }

  @ApiOperation({ summary: 'Обновление заказа' })
  @ApiResponse({ status: 200, type: Order, description: 'Заказ обновлен' })
  @Roles('ADMIN', 'MANAGER')
  @UseGuards(RolesGuard)
  @Put(':id')
  update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
    return this.ordersService.update(+id, updateOrderDto);
  }

  @ApiOperation({ summary: 'Обновление статуса заказа' })
  @ApiResponse({ status: 200, type: Order, description: 'Статус обновлен' })
  @Roles('ADMIN', 'MANAGER')
  @UseGuards(RolesGuard)
  @Put(':id/status')
  updateStatus(@Param('id') id: string, @Body('statusId') statusId: number) {
    return this.ordersService.updateStatus(+id, statusId);
  }

  @ApiOperation({ summary: 'Отмена заказа' })
  @ApiResponse({ status: 200, type: Order, description: 'Заказ отменен' })
  @Put(':id/cancel')
  cancel(@Param('id') id: string) {
    return this.ordersService.cancel(+id);
  }

  @ApiOperation({ summary: 'Удаление заказа' })
  @ApiResponse({ status: 200, description: 'Заказ удален' })
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ordersService.remove(+id);
  }
}