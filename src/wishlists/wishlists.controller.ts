import { Controller, Get, Post, Delete, Param, Req, UseGuards, HttpException, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Wishlist } from './wishlists.model';
import { WishlistsService } from './wishlists.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Избранное')
@ApiBearerAuth()
@Controller('wishlists')
export class WishlistsController {
  constructor(private readonly wishlistsService: WishlistsService) {}

  @ApiOperation({ summary: 'Получение списка избранного пользователя' })
  @ApiResponse({ status: 200, type: [Wishlist], description: 'Список избранного' })
  @UseGuards(JwtAuthGuard) 
  @Get()
  async findMyWishlist(@Req() req) {
    console.log(' WishlistsController.findMyWishlist req.user:', req.user);
    if (!req.user) {
      throw new HttpException('Пользователь не авторизован', HttpStatus.UNAUTHORIZED);
    }
    const userId = req.user.id;
    return this.wishlistsService.findByUser(userId);
  }

  @ApiOperation({ summary: 'Добавление товара в избранное' })
  @ApiResponse({ status: 201, type: Wishlist, description: 'Товар добавлен в избранное' })
  @UseGuards(JwtAuthGuard) 
  @Post(':productId')
  async add(@Param('productId') productId: string, @Req() req) {
    console.log(' WishlistsController.add req.user:', req.user);
    if (!req.user) {
      throw new HttpException('Пользователь не авторизован', HttpStatus.UNAUTHORIZED);
    }
    const userId = req.user.id;
    return this.wishlistsService.add(userId, +productId);
  }

  @ApiOperation({ summary: 'Удаление товара из избранного' })
  @ApiResponse({ status: 200, description: 'Товар удален из избранного' })
  @UseGuards(JwtAuthGuard)
  @Delete(':productId')
  async remove(@Param('productId') productId: string, @Req() req) {
    if (!req.user) {
      throw new HttpException('Пользователь не авторизован', HttpStatus.UNAUTHORIZED);
    }
    const userId = req.user.id;
    return this.wishlistsService.remove(userId, +productId);
  }

  @ApiOperation({ summary: 'Проверка, есть ли товар в избранном' })
  @ApiResponse({ status: 200, description: 'Результат проверки' })
  @UseGuards(JwtAuthGuard)
  @Get('check/:productId')
  async check(@Param('productId') productId: string, @Req() req) {
    if (!req.user) {
      throw new HttpException('Пользователь не авторизован', HttpStatus.UNAUTHORIZED);
    }
    const userId = req.user.id;
    return this.wishlistsService.check(userId, +productId);
  }

  @ApiOperation({ summary: 'Очистка избранного' })
  @ApiResponse({ status: 200, description: 'Избранное очищено' })
  @UseGuards(JwtAuthGuard)
  @Delete()
  async clear(@Req() req) {
    if (!req.user) {
      throw new HttpException('Пользователь не авторизован', HttpStatus.UNAUTHORIZED);
    }
    const userId = req.user.id;
    return this.wishlistsService.clear(userId);
  }
}