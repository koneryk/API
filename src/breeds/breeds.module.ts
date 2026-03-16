import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { BreedsController } from './breeds.controller';
import { BreedsService } from './breeds.service';
import { Breed } from './breeds.model';
import { AuthModule } from '../auth/auth.module';
@Module({
  imports: [SequelizeModule.forFeature([Breed]),AuthModule],
  controllers: [BreedsController],
  providers: [BreedsService],
  exports: [BreedsService],
})
export class BreedsModule {}