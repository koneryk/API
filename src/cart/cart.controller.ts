import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, Req, HttpException, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CartService } from './cart.service';
import { CartItem } from './cart.model';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

class AvailabilityItemDto {
  product_id: number;
  name: string;
  requested: number;
  available: number;
  in_stock: boolean;
}

class AvailabilityResultDto {
  available: boolean;
  items: AvailabilityItemDto[];
}

class TotalItemDto {
  product_id: number;
  name: string;
  price: number;
  quantity: number;
  subtotal: number;
  in_stock: boolean;
  available: number;
}

class TotalResultDto {
  total: number;
  items: TotalItemDto[];
}

@ApiTags('Корзина')
@ApiBearerAuth()
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @ApiOperation({ summary: 'Получить корзину пользователя' })
  @ApiResponse({ status: 200, type: [CartItem], description: 'Список товаров в корзине' })
  @UseGuards(JwtAuthGuard)
  @Get()
  async getCart(@Req() req) {
    if (!req.user) {
      throw new HttpException('Пользователь не авторизован', HttpStatus.UNAUTHORIZED);
    }
    const userId = req.user.id;
    return this.cartService.getCart(userId);
  }

  @ApiOperation({ summary: 'Добавить товар в корзину' })
  @ApiResponse({ status: 201, type: CartItem, description: 'Товар добавлен в корзину' })
  @UseGuards(JwtAuthGuard)
  @Post()
  async addToCart(@Body() addToCartDto: AddToCartDto, @Req() req) {
    if (!req.user) {
      throw new HttpException('Пользователь не авторизован', HttpStatus.UNAUTHORIZED);
    }
    const userId = req.user.id;
    return this.cartService.addToCart(userId, addToCartDto);
  }

  @ApiOperation({ summary: 'Обновить количество товара в корзине' })
  @ApiResponse({ status: 200, type: CartItem, description: 'Количество обновлено' })
  @UseGuards(JwtAuthGuard)
  @Put(':productId')
  async updateQuantity(
    @Param('productId') productId: string,
    @Body() updateDto: UpdateCartItemDto,
    @Req() req,
  ) {
    if (!req.user) {
      throw new HttpException('Пользователь не авторизован', HttpStatus.UNAUTHORIZED);
    }
    const userId = req.user.id;
    return this.cartService.updateQuantity(userId, +productId, updateDto);
  }

  @ApiOperation({ summary: 'Удалить товар из корзины' })
  @ApiResponse({ status: 200, description: 'Товар удалён из корзины' })
  @UseGuards(JwtAuthGuard)
  @Delete(':productId')
  async removeFromCart(@Param('productId') productId: string, @Req() req) {
    if (!req.user) {
      throw new HttpException('Пользователь не авторизован', HttpStatus.UNAUTHORIZED);
    }
    const userId = req.user.id;
    return this.cartService.removeFromCart(userId, +productId);
  }

  @ApiOperation({ summary: 'Очистить корзину' })
  @ApiResponse({ status: 200, description: 'Корзина очищена' })
  @UseGuards(JwtAuthGuard)
  @Delete()
  async clearCart(@Req() req) {
    if (!req.user) {
      throw new HttpException('Пользователь не авторизован', HttpStatus.UNAUTHORIZED);
    }
    const userId = req.user.id;
    return this.cartService.clearCart(userId);
  }

  @ApiOperation({ summary: 'Проверить наличие товаров в корзине' })
  @ApiResponse({ status: 200, type: AvailabilityResultDto, description: 'Результат проверки наличия' }) // 👈 ДОБАВЛЯЕМ type
  @UseGuards(JwtAuthGuard)
  @Get('check-availability')
  async checkAvailability(@Req() req) {
    if (!req.user) {
      throw new HttpException('Пользователь не авторизован', HttpStatus.UNAUTHORIZED);
    }
    const userId = req.user.id;
    return this.cartService.checkAvailability(userId);
  }

  @ApiOperation({ summary: 'Получить общую сумму корзины' })
  @ApiResponse({ status: 200, type: TotalResultDto, description: 'Общая сумма корзины' }) // 👈 ДОБАВЛЯЕМ type
  @UseGuards(JwtAuthGuard)
  @Get('total')
  async getTotal(@Req() req) {
    if (!req.user) {
      throw new HttpException('Пользователь не авторизован', HttpStatus.UNAUTHORIZED);
    }
    const userId = req.user.id;
    return this.cartService.getTotal(userId);
  }
}