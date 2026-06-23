import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User } from '../users/users.model';
import { Role } from '../roles/roles.model';
import { UserRoles } from '../roles/user-roles.model';
import * as bcrypt from 'bcryptjs';
import { OrderStatus } from '../orders/orders.model'; // 👈 ИСПРАВЛЕНО: '../orders/orders.model'

@Injectable()
export class SeedService implements OnModuleInit {
  constructor(
    @InjectModel(User) private userModel: typeof User,
    @InjectModel(Role) private roleModel: typeof Role,
    @InjectModel(UserRoles) private userRolesModel: typeof UserRoles,
    @InjectModel(OrderStatus) private orderStatusModel: typeof OrderStatus,
  ) {}

  async onModuleInit() {
    console.log('Запуск Seed-модуля...');
    await this.seedRoles();
    await this.seedOrderStatuses();
    await this.seedAdminUser();
    console.log('Seed-модуль завершил работу');
  }

  private async seedRoles() {
    console.log('Создание ролей...');

    const roles = [
      { value: 'ADMIN', description: 'Администратор' },
      { value: 'CUSTOMER', description: 'Клиент' },
      { value: 'MANAGER', description: 'Менеджер' },
      { value: 'customer', description: 'Клиент' },
    ];

    for (const role of roles) {
      const existing = await this.roleModel.findOne({
        where: { value: role.value },
      });

      if (!existing) {
        await this.roleModel.create(role);
        console.log(` Роль "${role.value}" создана`);
      } else {
        console.log(`Роль "${role.value}" уже существует`);
      }
    }
  }

  private async seedOrderStatuses() {
    console.log('Создание статусов заказов...');

    const statuses = [
      { id: 1, status_name: 'pending', description: 'Заказ ожидает обработки' },
      { id: 2, status_name: 'processing', description: 'Заказ обрабатывается' },
      { id: 3, status_name: 'shipped', description: 'Заказ отправлен' },
      { id: 4, status_name: 'delivered', description: 'Заказ доставлен' },
      { id: 5, status_name: 'cancelled', description: 'Заказ отменен' },
    ];

    for (const status of statuses) {
      const existing = await this.orderStatusModel.findByPk(status.id);
      if (!existing) {
        await this.orderStatusModel.create(status as any);
        console.log(` Статус "${status.status_name}" создан`);
      } else {
        console.log(`Статус "${status.status_name}" уже существует`);
      }
    }
  }

  private async seedAdminUser() {
    console.log('Создание/проверка администратора...');

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

    let adminRole = await this.roleModel.findOne({
      where: { value: 'ADMIN' },
    });

    if (!adminRole) {
      console.log('Роль ADMIN не найдена, создаём...');
      adminRole = await this.roleModel.create({
        value: 'ADMIN',
        description: 'Администратор',
      });
      console.log(' Роль ADMIN создана');
    }

    let user = await this.userModel.findOne({
      where: { email: adminEmail },
    });

    if (!user) {
      console.log(`Создание пользователя ${adminEmail}...`);
      const hashPassword = await bcrypt.hash(adminPassword, 5);
      user = await this.userModel.create({
        email: adminEmail,
        password_hash: hashPassword,
        first_name: 'Admin',
        last_name: 'System',
        phone: '+70000000000',
        address: 'System Address',
        is_active: true,
      } as any);
      console.log(` Пользователь создан (ID: ${user.id})`);
    } else {
      console.log(`Пользователь ${adminEmail} уже существует (ID: ${user.id})`);
    }

    const existingAdminRole = await this.userRolesModel.findOne({
      where: {
        userId: user.id,
        roleId: adminRole.id,
      },
    });

    if (existingAdminRole) {
      console.log(`Роль ADMIN уже есть у ${adminEmail}`);
    } else {
      await this.userRolesModel.create({
        userId: user.id,
        roleId: adminRole.id,
      } as any);
      console.log(` Роль ADMIN назначена пользователю ${adminEmail}`);
    }

    const customerRole = await this.roleModel.findOne({
      where: { value: 'customer' },
    });

    if (customerRole) {
      const existingCustomerRole = await this.userRolesModel.findOne({
        where: {
          userId: user.id,
          roleId: customerRole.id,
        },
      });

      if (!existingCustomerRole) {
        await this.userRolesModel.create({
          userId: user.id,
          roleId: customerRole.id,
        } as any);
        console.log(` Роль customer назначена`);
      }
    }

    const userWithRoles = await this.userModel.findByPk(user.id, {
      include: [{ model: Role }],
    });

    const roles = userWithRoles?.roles?.map(r => r.value) || [];
    console.log(`Роли пользователя ${adminEmail}: ${roles.join(', ')}`);

    if (roles.includes('ADMIN')) {
      console.log(` Администратор успешно создан: ${adminEmail} / ${adminPassword}`);
      console.log(` Роли в токене будут: ${roles.join(', ')}`);
    } else {
      console.error('У АДМИНИСТРАТОРА НЕТ РОЛИ ADMIN!');
      console.log('Принудительное исправление...');

      await this.userRolesModel.destroy({
        where: { userId: user.id },
      });

      await this.userRolesModel.create({
        userId: user.id,
        roleId: adminRole.id,
      } as any);

      if (customerRole) {
        await this.userRolesModel.create({
          userId: user.id,
          roleId: customerRole.id,
        } as any);
      }

      const finalCheck = await this.userModel.findByPk(user.id, {
        include: [{ model: Role }],
      });

      const finalRoles = finalCheck?.roles?.map(r => r.value) || [];
      console.log(`Роли после исправления: ${finalRoles.join(', ')}`);

      if (finalRoles.includes('ADMIN')) {
        console.log(' Администратор успешно исправлен!');
        console.log(` Теперь войдите заново: ${adminEmail} / ${adminPassword}`);
      } else {
        console.error('НЕ УДАЛОСЬ ИСПРАВИТЬ!');
        console.log('Проверьте модель UserRoles и названия колонок в БД');
      }
    }
  }
}