import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { SeedService } from './seed.service';
import { User } from '../users/users.model';
import { Role } from '../roles/roles.model';
import { UserRoles } from '../roles/user-roles.model';
import { OrderStatus } from '../orders/orders.model'; 

@Module({
  imports: [SequelizeModule.forFeature([User, Role, UserRoles,OrderStatus])],
  providers: [SeedService],
  exports: [SeedService],
})
export class SeedModule {}