import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { OrderStatusesController } from './order-statuses.controller';
import { OrderStatusesService } from './order-statuses.service';
import { OrderStatus } from './order-statuses.model';
import { AuthModule } from '../auth/auth.module';
@Module({
  imports: [
    SequelizeModule.forFeature([OrderStatus]),
    AuthModule,
  ],
  controllers: [OrderStatusesController],
  providers: [OrderStatusesService],
  exports: [OrderStatusesService],
})
export class OrderStatusesModule {}