import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { Product } from './products.model';
import { ProductImage } from '../product-images/product-images.model';
import { ProductCharacteristic } from '../product-characteristics/product-characteristics.model';
import { Review } from '../reviews/reviews.model';
import { AuthModule } from '../auth/auth.module';
import { ProductCharacteristicsService } from 'src/product-characteristics/product-characteristics.service';
import { ProductImagesService } from 'src/product-images/product-images.service';


@Module({
  imports: [SequelizeModule.forFeature([Product, ProductImage, ProductCharacteristic, Review]),AuthModule],
  controllers: [ProductsController],
  providers: [ProductsService,ProductCharacteristicsService,ProductImagesService],
  exports: [ProductsService],
})
export class ProductsModule {}