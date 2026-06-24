import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Wishlist } from './wishlists.model';
import { Product } from '../products/products.model';

@Injectable()
export class WishlistsService {
  constructor(
    @InjectModel(Wishlist)
    private wishlistModel: typeof Wishlist,
  ) {}

  async findByUser(userId: Wishlist["user_id"]): Promise<Wishlist[]> {
    return this.wishlistModel.findAll({
      where: { user_id: userId },
      include: [{ model: Product }],
    });
  }

  async add(userId: Wishlist["user_id"], productId: Wishlist["product_id"]): Promise<Wishlist> {
    const existing = await this.wishlistModel.findOne({
      where: { user_id: userId, product_id: productId },
    });

    if (existing) {
      throw new HttpException('Товар уже в избранном', HttpStatus.BAD_REQUEST);
    }

    const wishlistItem = await this.wishlistModel.create({
      user_id: userId,
      product_id: productId,
    } as any);

    return wishlistItem;
  }

  async remove(userId: Wishlist["user_id"], productId: Wishlist["product_id"]): Promise<void> {
    const item = await this.wishlistModel.findOne({
      where: { user_id: userId, product_id: productId },
    });

    if (!item) {
      throw new HttpException('Товар не найден в избранном', HttpStatus.NOT_FOUND);
    }

    await item.destroy();
  }

  async check(userId: Wishlist["user_id"], productId: Wishlist["product_id"]): Promise<{ inWishlist: boolean }> {
    const item = await this.wishlistModel.findOne({
      where: { user_id: userId, product_id: productId },
    });

    return { inWishlist: !!item };
  }

  async clear(userId: Wishlist["user_id"]): Promise<void> {
    await this.wishlistModel.destroy({
      where: { user_id: userId },
    });
  }
}