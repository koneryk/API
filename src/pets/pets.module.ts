import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { PetsController } from './pets.controller';
import { PetsService } from './pets.service';
import { Species } from './species.model';
import { Breed } from './breeds.model';
import { Pet } from './pets.model';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    SequelizeModule.forFeature([Species, Breed, Pet]),
    AuthModule,
  ],
  controllers: [PetsController],
  providers: [PetsService],
  exports: [PetsService],
})
export class PetsModule {}