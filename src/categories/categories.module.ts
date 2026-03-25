import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';
import { Category } from './categories.model';
import { AuthModule } from '../auth/auth.module';
@Module({
  imports: [SequelizeModule.forFeature([Category]),AuthModule],
  controllers: [CategoriesController],
  providers: [CategoriesService],
  exports: [CategoriesService],
})
export class CategoriesModule {}