import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { Product } from './products.model';
import { ProductImage } from './product-images.model';
import { ProductCharacteristic } from './product-characteristics.model';
import { Review } from '../reviews/reviews.model';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    SequelizeModule.forFeature([
      Product,
      ProductImage,
      ProductCharacteristic,
      Review
    ]),
    AuthModule
  ],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}