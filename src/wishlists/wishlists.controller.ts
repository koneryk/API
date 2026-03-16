import { Controller, Get, Post, Delete, Param, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Wishlist } from './wishlists.model';
import { WishlistsService } from './wishlists.service';
import { RolesGuard } from '../auth/roles.guard';

@ApiTags('Избранное')
@ApiBearerAuth()
@Controller('wishlists')
export class WishlistsController {
  constructor(private readonly wishlistsService: WishlistsService) {}

  @ApiOperation({ summary: 'Получение списка избранного пользователя' })
  @ApiResponse({ status: 200, type: [Wishlist], description: 'Список избранного' })
  @Get()
  findMyWishlist(@Req() req) {
    const userId = req.user.id;
    return this.wishlistsService.findByUser(userId);
  }

  @ApiOperation({ summary: 'Добавление товара в избранное' })
  @ApiResponse({ status: 201, type: Wishlist, description: 'Товар добавлен в избранное' })
  @Post(':productId')
  add(@Param('productId') productId: string, @Req() req) {
    const userId = req.user.id;
    return this.wishlistsService.add(userId, +productId);
  }

  @ApiOperation({ summary: 'Удаление товара из избранного' })
  @ApiResponse({ status: 200, description: 'Товар удален из избранного' })
  @Delete(':productId')
  remove(@Param('productId') productId: string, @Req() req) {
    const userId = req.user.id;
    return this.wishlistsService.remove(userId, +productId);
  }

  @ApiOperation({ summary: 'Проверка, есть ли товар в избранном' })
  @ApiResponse({ status: 200, description: 'Результат проверки' })
  @Get('check/:productId')
  check(@Param('productId') productId: string, @Req() req) {
    const userId = req.user.id;
    return this.wishlistsService.check(userId, +productId);
  }

  @ApiOperation({ summary: 'Очистка избранного' })
  @ApiResponse({ status: 200, description: 'Избранное очищено' })
  @Delete()
  clear(@Req() req) {
    const userId = req.user.id;
    return this.wishlistsService.clear(userId);
  }
}