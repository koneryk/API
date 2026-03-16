import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { DiscountProductsController } from './discount-products.controller';
import { DiscountProductsService } from './discount-products.service';
import { DiscountProduct } from './discount-products.model';
import { AuthModule } from '../auth/auth.module';
@Module({
  imports: [SequelizeModule.forFeature([DiscountProduct]),AuthModule],
  controllers: [DiscountProductsController],
  providers: [DiscountProductsService],
  exports: [DiscountProductsService],
})
export class DiscountProductsModule {}
