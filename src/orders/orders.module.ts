import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { Order } from './orders.model';
import { OrderItem } from '../order-items/order-items.model';
import { AuthModule } from '../auth/auth.module';
@Module({
  imports: [SequelizeModule.forFeature([Order, OrderItem]),AuthModule],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}