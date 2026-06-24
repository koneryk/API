import { Module, forwardRef } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Order, OrderItem, OrderStatus } from './orders.model';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import {AuthModule} from "../auth/auth.module";
import { Product } from 'src/products/products.model';
import { InventoryModule } from 'src/inventory/inventory.module';


@Module({
  imports: [
    SequelizeModule.forFeature([OrderStatus, OrderItem, Order, Product]), forwardRef(() => InventoryModule),
    AuthModule,
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}