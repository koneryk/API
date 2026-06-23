import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { ConfigModule } from "@nestjs/config";
import * as process from "node:process";

import { UsersModule } from "./src/users/users.module";
import { DiscountsModule } from "./src/discounts/discounts.module";
import { BrandsModule } from "./src/brands/brands.module";
import { PetsModule } from "./src/pets/pets.module";
import { CategoriesModule } from "./src/categories/categories.module";
import { ProductsModule } from "./src/products/products.module";
import { OrdersModule } from "./src/orders/orders.module";
import { CharacteristicsModule } from "./src/characteristics/characteristics.module";
import { ReviewsModule } from "./src/reviews/reviews.module";
import { WishlistsModule } from "./src/wishlists/wishlists.module";
import { DiscountProductsModule } from "./src/discount-products/discount-products.module";
import { AuthModule } from "./src/auth/auth.module";
import { RolesModule } from "./src/roles/roles.module";
import { SeedModule } from "src/seed/seed.module";

import { User } from "./src/users/users.model";
import { Discount } from "./src/discounts/discounts.model";
import { Brand } from "./src/brands/brands.model";
import { Species } from "./src/pets/species.model";
import { Breed } from "./src/pets/breeds.model";
import { Pet } from "./src/pets/pets.model";
import { Category } from "./src/categories/categories.model";
import { Product } from "./src/products/products.model";
import { Order, OrderItem, OrderStatus } from "./src/orders/orders.model";
import { Characteristic } from "./src/characteristics/characteristics.model";
import { ProductCharacteristic } from "./src/products/product-characteristics.model";
import { ProductImage } from "./src/products/product-images.model";
import { Review } from "./src/reviews/reviews.model";
import { Wishlist } from "./src/wishlists/wishlists.model";
import { DiscountProduct } from "./src/discount-products/discount-products.model";
import { Role } from "./src/roles/roles.model";
import { UserRoles } from "./src/roles/user-roles.model";

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `.${process.env.NODE_ENV}.env`,
    }),

    SequelizeModule.forRoot({
      dialect: "postgres",
      host: process.env.POSTGRES_HOST,
      port: Number(process.env.POSTGRES_PORT),
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DB,
      models: [
        User,
        Discount,
        Brand,
        Species,
        Breed,
        Pet,
        Category,
        Product,
        OrderStatus,
        OrderItem,
        Order,
        Characteristic,
        ProductCharacteristic,
        ProductImage,
        Review,
        Wishlist,
        DiscountProduct,
        Role,
        UserRoles,
      ],
      autoLoadModels: true,
      synchronize: true,
      sync: { force: true },
    }),
    UsersModule,
    SeedModule,
    DiscountsModule,
    BrandsModule,
    PetsModule,
    CategoriesModule,
    ProductsModule,
    OrdersModule,
    CharacteristicsModule,
    ReviewsModule,
    WishlistsModule,
    DiscountProductsModule,
    AuthModule,
    RolesModule,
  ],
})
export class AppModule {}