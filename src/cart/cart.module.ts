import { Module, forwardRef } from '@nestjs/common'; 
import { SequelizeModule } from '@nestjs/sequelize';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';
import { CartItem } from './cart.model';
import { Product } from '../products/products.model';
import { AuthModule } from '../auth/auth.module';
import { InventoryModule } from 'src/inventory/inventory.module';

@Module({
  imports: [
    SequelizeModule.forFeature([CartItem, Product]),
    forwardRef(() => InventoryModule),
    AuthModule,
  ],
  controllers: [CartController],
  providers: [CartService],
  exports: [CartService],
})
export class CartModule {}