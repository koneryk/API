import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { CharacteristicsController } from './characteristics.controller';
import { CharacteristicsService } from './characteristics.service';
import { Characteristic } from './characteristics.model';
import { AuthModule } from '../auth/auth.module';
@Module({
  imports: [SequelizeModule.forFeature([Characteristic]),AuthModule],
  controllers: [CharacteristicsController],
  providers: [CharacteristicsService],
  exports: [CharacteristicsService],
})
export class CharacteristicsModule {}