import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ConfigModule } from '@nestjs/config';
import * as process from 'node:process';

import { UsersModule } from './users/users.module';
import { OrderStatusesModule } from './order-statuses/order-statuses.module';
import { DiscountsModule } from './discounts/discounts.module';
import { BrandsModule } from './brands/brands.module';
import { SpeciesModule } from './species/species.module';
import { BreedsModule } from './breeds/breeds.module';
import { PetsModule } from './pets/pets.module';
import { CategoriesModule } from './categories/categories.module';
import { ProductsModule } from './products/products.module';
import { OrdersModule } from './orders/orders.module';
import { OrderItemsModule } from './order-items/order-items.module';
import { CharacteristicsModule } from './characteristics/characteristics.module';
import { ProductCharacteristicsModule } from './product-characteristics/product-characteristics.module';
import { ProductImagesModule } from './product-images/product-images.module';
import { ReviewsModule } from './reviews/reviews.module';
import { WishlistsModule } from './wishlists/wishlists.module';
import { DiscountProductsModule } from './discount-products/discount-products.module';
import { AuthModule } from './auth/auth.module';
import { RolesModule } from './roles/roles.module';

import { User } from './users/users.model';
import { OrderStatus } from './order-statuses/order-statuses.model';
import { Discount } from './discounts/discounts.model';
import { Brand } from './brands/brands.model';
import { Species } from './species/species.model';
import { Breed } from './breeds/breeds.model';
import { Pet } from './pets/pets.model';
import { Category } from './categories/categories.model';
import { Product } from './products/products.model';
import { Order } from './orders/orders.model';
import { OrderItem } from './order-items/order-items.model';
import { Characteristic } from './characteristics/characteristics.model';
import { ProductCharacteristic } from './product-characteristics/product-characteristics.model';
import { ProductImage } from './product-images/product-images.model';
import { Review } from './reviews/reviews.model';
import { Wishlist } from './wishlists/wishlists.model';
import { DiscountProduct } from './discount-products/discount-products.model';
import { Role } from './roles/roles.model';
import { UserRoles } from './roles/user-roles.model';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `.${process.env.NODE_ENV}.env`,
    }),

    SequelizeModule.forRoot({
      dialect: 'postgres',
      host: process.env.POSTGRES_HOST,
      port: Number(process.env.POSTGRES_PORT),
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DB,
      models: [
        User, OrderStatus, Discount, Brand, Species, Breed, Pet, Category,
        Product, Order, OrderItem, Characteristic, ProductCharacteristic,
        ProductImage, Review, Wishlist, DiscountProduct, Role, UserRoles
      ],
      autoLoadModels: true,
      synchronize: true,
      sync: { force: true },
    }),
    UsersModule,
    OrderStatusesModule,
    DiscountsModule,
    BrandsModule,
    SpeciesModule,
    BreedsModule,
    PetsModule,
    CategoriesModule,
    ProductsModule,
    OrdersModule,
    OrderItemsModule,
    CharacteristicsModule,
    ProductCharacteristicsModule,
    ProductImagesModule,
    ReviewsModule,
    WishlistsModule,
    DiscountProductsModule,
    AuthModule,
    RolesModule,
  ],
})
export class AppModule {}