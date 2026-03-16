import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from '../users/users.model';
import { OrderStatus } from '../order-statuses/order-statuses.model';
import { Discount } from '../discounts/discounts.model';
import { Brand } from '../brands/brands.model';
import { Species } from '../species/species.model';
import { Breed } from '../breeds/breeds.model';
import { Pet } from '../pets/pets.model';
import { Category } from '../categories/categories.model';
import { Product } from '../products/products.model';
import { Order } from '../orders/orders.model';
import { OrderItem } from '../order-items/order-items.model';
import { Characteristic } from '../characteristics/characteristics.model';
import { ProductCharacteristic } from '../product-characteristics/product-characteristics.model';
import { ProductImage } from '../product-images/product-images.model';
import { Review } from '../reviews/reviews.model';
import { Wishlist } from '../wishlists/wishlists.model';
import { DiscountProduct } from '../discount-products/discount-products.model';
import { UserRoles } from '../roles/user-roles.model';
import { Role } from '../roles/roles.model';
import { AuthModule } from '../auth/auth.module';
@Module({
  imports: [
    SequelizeModule.forFeature([
      User,
      OrderStatus,
      Discount,
      Brand,
      Species,
      Breed,
      Pet,
      Category,
      Product,
      Order,
      OrderItem,
      Characteristic,
      Review,
      Wishlist,
      DiscountProduct,
      UserRoles,
      Role,
      AuthModule,
    ]),
  ],
  exports: [SequelizeModule],
})
export class ModelsModule {}
