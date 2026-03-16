import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Review } from './reviews.model';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { Product } from '../products/products.model';
import { User } from '../users/users.model';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectModel(Review)
    private reviewModel: typeof Review,
  ) {}

  async create(createReviewDto: CreateReviewDto, userId: number): Promise<Review> {
    const reviewData = {
      product_id: createReviewDto.product_id,
      user_id: userId,
      rating: createReviewDto.rating,
      comment: createReviewDto.comment,
      is_approved: false,
    };
    return this.reviewModel.create(reviewData as any);
  }

  async findAll(): Promise<Review[]> {
    return this.reviewModel.findAll({
      include: [
        { model: Product },
        { model: User },
      ],
    });
  }

  async findByProduct(productId: number): Promise<Review[]> {
    return this.reviewModel.findAll({
      where: { product_id: productId },
      include: [{ model: User }],
    });
  }

  async findByUser(userId: number): Promise<Review[]> {
    return this.reviewModel.findAll({
      where: { user_id: userId },
      include: [{ model: Product }],
    });
  }

  async findApprovedByProduct(productId: number): Promise<Review[]> {
    return this.reviewModel.findAll({
      where: { product_id: productId, is_approved: true },
      include: [{ model: User }],
    });
  }

  async findOne(id: number): Promise<Review> {
    const review = await this.reviewModel.findByPk(id, {
      include: [
        { model: Product },
        { model: User },
      ],
    });

    if (!review) {
      throw new HttpException('Отзыв не найден', HttpStatus.NOT_FOUND);
    }

    return review;
  }

  async update(id: number, updateReviewDto: UpdateReviewDto): Promise<Review> {
    const review = await this.findOne(id);
    await review.update(updateReviewDto);
    return review;
  }

  async approve(id: number): Promise<Review> {
    const review = await this.findOne(id);
    await review.update({ is_approved: true });
    return review;
  }

  async reject(id: number): Promise<Review> {
    const review = await this.findOne(id);
    await review.update({ is_approved: false });
    return review;
  }

  async remove(id: number): Promise<void> {
    const review = await this.findOne(id);
    await review.destroy();
  }
}