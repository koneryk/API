import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, Query, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Review } from './reviews.model';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles-auth.decorator';

@ApiTags('Отзывы')
@ApiBearerAuth()
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @ApiOperation({ summary: 'Добавление отзыва' })
  @ApiResponse({ status: 201, type: Review, description: 'Отзыв добавлен' })
  @Post()
  create(@Body() createReviewDto: CreateReviewDto, @Req() req) {
    const userId = req.user.id;
    return this.reviewsService.create(createReviewDto, userId);
  }

  @ApiOperation({ summary: 'Получение всех отзывов' })
  @ApiResponse({ status: 200, type: [Review], description: 'Список отзывов' })
  @Get()
  findAll() {
    return this.reviewsService.findAll();
  }

  @ApiOperation({ summary: 'Получение отзывов по товару' })
  @ApiResponse({ status: 200, type: [Review], description: 'Отзывы о товаре' })
  @Get('by-product/:productId')
  findByProduct(@Param('productId') productId: string) {
    return this.reviewsService.findByProduct(+productId);
  }

  @ApiOperation({ summary: 'Получение отзывов по пользователю' })
  @ApiResponse({ status: 200, type: [Review], description: 'Отзывы пользователя' })
  @Get('by-user/:userId')
  findByUser(@Param('userId') userId: string) {
    return this.reviewsService.findByUser(+userId);
  }

  @ApiOperation({ summary: 'Получение одобренных отзывов о товаре' })
  @ApiResponse({ status: 200, type: [Review], description: 'Одобренные отзывы' })
  @Get('by-product/:productId/approved')
  findApprovedByProduct(@Param('productId') productId: string) {
    return this.reviewsService.findApprovedByProduct(+productId);
  }

  @ApiOperation({ summary: 'Получение отзыва по ID' })
  @ApiResponse({ status: 200, type: Review, description: 'Отзыв найден' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.reviewsService.findOne(+id);
  }

  @ApiOperation({ summary: 'Обновление отзыва' })
  @ApiResponse({ status: 200, type: Review, description: 'Отзыв обновлен' })
  @Put(':id')
  update(@Param('id') id: string, @Body() updateReviewDto: UpdateReviewDto) {
    return this.reviewsService.update(+id, updateReviewDto);
  }

  @ApiOperation({ summary: 'Одобрение отзыва' })
  @ApiResponse({ status: 200, type: Review, description: 'Отзыв одобрен' })
  @Roles('ADMIN', 'MANAGER')
  @UseGuards(RolesGuard)
  @Put(':id/approve')
  approve(@Param('id') id: string) {
    return this.reviewsService.approve(+id);
  }

  @ApiOperation({ summary: 'Отклонение отзыва' })
  @ApiResponse({ status: 200, type: Review, description: 'Отзыв отклонен' })
  @Roles('ADMIN', 'MANAGER')
  @UseGuards(RolesGuard)
  @Put(':id/reject')
  reject(@Param('id') id: string) {
    return this.reviewsService.reject(+id);
  }

  @ApiOperation({ summary: 'Удаление отзыва' })
  @ApiResponse({ status: 200, description: 'Отзыв удален' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.reviewsService.remove(+id);
  }
}