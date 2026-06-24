import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { RepositoryController } from './repository.controller';
import { RepositoryService } from './repository.service';
import { Repository, RepositoryStock } from './repository.model';
import { Product } from '../products/products.model';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    SequelizeModule.forFeature([Repository, RepositoryStock, Product]),
    AuthModule,
  ],
  controllers: [RepositoryController],
  providers: [RepositoryService],
  exports: [RepositoryService],
})
export class RepositoryModule {}