import { Module, forwardRef } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { InventoryController } from './inventory.controller';
import { InventoryService } from './inventory.service';
import { ProductInventory } from './inventory.model';
import { Product } from '../products/products.model';
import { RepositoryStock, Repository } from '../repository/repository.model';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    SequelizeModule.forFeature([
      ProductInventory,
      Product,
      RepositoryStock,
      Repository,
    ]),
    AuthModule,
  ],
  controllers: [InventoryController],
  providers: [InventoryService],
  exports: [InventoryService],
})
export class InventoryModule {}