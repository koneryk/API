import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ProductCharacteristicsController } from './product-characteristics.controller';
import { ProductCharacteristicsService } from './product-characteristics.service';
import { ProductCharacteristic } from './product-characteristics.model';
import { AuthModule } from '../auth/auth.module';
@Module({
  imports: [SequelizeModule.forFeature([ProductCharacteristic]),AuthModule],
  controllers: [ProductCharacteristicsController],
  providers: [ProductCharacteristicsService],
  exports: [ProductCharacteristicsService],
})
export class ProductCharacteristicsModule {}