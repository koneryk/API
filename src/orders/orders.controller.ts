import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, Query, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Order } from './orders.model';
import { OrderItem } from './order-items.model';
import { OrderStatus } from './order-statuses.model';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { CreateOrderItemDto } from './dto/create-order-item.dto';
import { UpdateOrderItemDto } from './dto/update-order-item.dto';
import { CreateOrderStatusDto } from './dto/create-order-status.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
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


  @ApiOperation({ summary: 'Добавление позиции в заказ' })
  @ApiResponse({ status: 201, type: OrderItem, description: 'Позиция добавлена' })
  @Post('items')
  createOrderItem(@Body() createOrderItemDto: CreateOrderItemDto) {
    return this.ordersService.createOrderItem(createOrderItemDto);
  }

  @ApiOperation({ summary: 'Получение всех позиций заказа' })
  @ApiResponse({ status: 200, type: [OrderItem], description: 'Список позиций' })
  @Roles('ADMIN', 'MANAGER')
  @UseGuards(RolesGuard)
  @Get('items')
  findAllOrderItems() {
    return this.ordersService.findAllOrderItems();
  }

  @ApiOperation({ summary: 'Получение позиций по заказу' })
  @ApiResponse({ status: 200, type: [OrderItem], description: 'Позиции заказа' })
  @Get('items/by-order/:orderId')
  findByOrderOrderItems(@Param('orderId') orderId: string) {
    return this.ordersService.findByOrderOrderItems(+orderId);
  }

  @ApiOperation({ summary: 'Получение позиции по ID' })
  @ApiResponse({ status: 200, type: OrderItem, description: 'Позиция найдена' })
  @Get('items/:id')
  findOneOrderItem(@Param('id') id: string) {
    return this.ordersService.findOneOrderItem(+id);
  }

  @ApiOperation({ summary: 'Обновление позиции' })
  @ApiResponse({ status: 200, type: OrderItem, description: 'Позиция обновлена' })
  @Put('items/:id')
  updateOrderItem(@Param('id') id: string, @Body() updateOrderItemDto: UpdateOrderItemDto) {
    return this.ordersService.updateOrderItem(+id, updateOrderItemDto);
  }

  @ApiOperation({ summary: 'Удаление позиции' })
  @ApiResponse({ status: 200, description: 'Позиция удалена' })
  @Delete('items/:id')
  removeOrderItem(@Param('id') id: string) {
    return this.ordersService.removeOrderItem(+id);
  }


  @ApiOperation({ summary: 'Создание нового статуса заказа' })
  @ApiResponse({ status: 201, type: OrderStatus, description: 'Статус создан' })
  @Roles('ADMIN', 'MANAGER')
  @UseGuards(RolesGuard)
  @Post('statuses')
  createOrderStatus(@Body() createOrderStatusDto: CreateOrderStatusDto) {
    return this.ordersService.createOrderStatus(createOrderStatusDto);
  }

  @ApiOperation({ summary: 'Получение всех статусов заказов' })
  @ApiResponse({ status: 200, type: [OrderStatus], description: 'Список статусов' })
  @Get('statuses')
  findAllOrderStatuses() {
    return this.ordersService.findAllOrderStatuses();
  }

  @ApiOperation({ summary: 'Получение статуса по ID' })
  @ApiResponse({ status: 200, type: OrderStatus, description: 'Статус найден' })
  @Get('statuses/:id')
  findOneOrderStatus(@Param('id') id: string) {
    return this.ordersService.findOneOrderStatus(+id);
  }

  @ApiOperation({ summary: 'Обновление статуса' })
  @ApiResponse({ status: 200, type: OrderStatus, description: 'Статус обновлен' })
  @Roles('ADMIN', 'MANAGER')
  @UseGuards(RolesGuard)
  @Put('statuses/:id')
  updateOrderStatus(@Param('id') id: string, @Body() updateOrderStatusDto: UpdateOrderStatusDto) {
    return this.ordersService.updateOrderStatus(+id, updateOrderStatusDto);
  }

  @ApiOperation({ summary: 'Удаление статуса' })
  @ApiResponse({ status: 200, description: 'Статус удален' })
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  @Delete('statuses/:id')
  removeOrderStatus(@Param('id') id: string) {
    return this.ordersService.removeOrderStatus(+id);
  }
}