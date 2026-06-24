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

  async findByProduct(productId: Review["product_id"]): Promise<Review[]> {
    return this.reviewModel.findAll({
      where: { product_id: productId },
      include: [{ model: User }],
    });
  }

  async findByUser(userId: Review["user_id"]): Promise<Review[]> {
    return this.reviewModel.findAll({
      where: { user_id: userId },
      include: [{ model: Product }],
    });
  }

  async findApprovedByProduct(productId: Review["product_id"]): Promise<Review[]> {
    return this.reviewModel.findAll({
      where: { product_id: productId, is_approved: true },
      include: [{ model: User }],
    });
  }

  async findOne(id: Review["id"]): Promise<Review> {
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

  async update(id: Review["id"], updateReviewDto: UpdateReviewDto): Promise<Review> {
    const review = await this.findOne(id);
    await review.update(updateReviewDto);
    return review;
  }

  async approve(id: Review["id"]): Promise<Review> {
    const review = await this.findOne(id);
    await review.update({ is_approved: true });
    return review;
  }

  async reject(id: Review["id"]): Promise<Review> {
    const review = await this.findOne(id);
    await review.update({ is_approved: false });
    return review;
  }

  async remove(id: Review["id"]): Promise<void> {
    const review = await this.findOne(id);
    await review.destroy();
  }
}