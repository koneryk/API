import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User } from './users.model';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcryptjs';
import { Pet } from '../pets/pets.model';
import { Order } from '../orders/orders.model';
import { Review } from '../reviews/reviews.model';
import { Role } from '../roles/roles.model';
import { UserRoles } from '../roles/user-roles.model';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User)
    private userModel: typeof User,
    @InjectModel(Role)
    private roleModel: typeof Role,
    @InjectModel(UserRoles)
    private userRolesModel: typeof UserRoles,
  ) {}

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    if (!createUserDto.password) {
      throw new HttpException('Пароль обязателен', HttpStatus.BAD_REQUEST);
    }

    const hashPassword = await bcrypt.hash(createUserDto.password, 5);

    const userData = {
      email: createUserDto.email,
      password_hash: hashPassword,
      first_name: createUserDto.first_name || '',
      last_name: createUserDto.last_name || '',
      phone: createUserDto.phone || '',
      address: createUserDto.address || '',
    };

    const user = await this.userModel.create(userData as any);
    return user;
  }

  async assignRole(userId: number, roleValue: string): Promise<void> {
    const user = await this.userModel.findByPk(userId);
    if (!user) {
      throw new HttpException('Пользователь не найден', HttpStatus.NOT_FOUND);
    }

    const role = await this.roleModel.findOne({
      where: { value: roleValue }
    });

    if (!role) {
      throw new HttpException(`Роль "${roleValue}" не найдена`, HttpStatus.NOT_FOUND);
    }

    const existing = await this.userRolesModel.findOne({
      where: {
        userId: userId,
        roleId: role.id,
      }
    });

    if (existing) {
      throw new HttpException(
        `Роль "${roleValue}" уже назначена пользователю`,
        HttpStatus.BAD_REQUEST
      );
    }

    await this.userRolesModel.create({
      userId: userId,
      roleId: role.id,
    } as any);
  }
async createAdmin(createUserDto: CreateUserDto): Promise<User> {
  const existingAdmin = await this.userModel.findOne({
    where: { email: createUserDto.email },
  });

  if (existingAdmin) {
    throw new HttpException('Пользователь с таким email уже существует', HttpStatus.BAD_REQUEST);
  }

  const hashPassword = await bcrypt.hash(createUserDto.password, 5);

  const user = await this.userModel.create({
    email: createUserDto.email,
    password_hash: hashPassword,
    first_name: createUserDto.first_name || 'Admin',
    last_name: createUserDto.last_name || 'System',
    phone: createUserDto.phone || '',
    address: createUserDto.address || '',
    is_active: true,
  } as any);

  const adminRole = await this.roleModel.findOne({
    where: { value: 'ADMIN' },
  });

  if (!adminRole) {
    throw new HttpException('Роль ADMIN не найдена в системе', HttpStatus.NOT_FOUND);
  }

  await this.userRolesModel.create({
    userId: user.id,
    roleId: adminRole.id,
  } as any);

  const customerRole = await this.roleModel.findOne({
    where: { value: 'customer' },
  });

  if (customerRole) {
    await this.userRolesModel.create({
      userId: user.id,
      roleId: customerRole.id,
    } as any);
  }

  return user;
}
  async removeRole(userId: number, roleValue: string): Promise<void> {
    const user = await this.userModel.findByPk(userId);
    if (!user) {
      throw new HttpException('Пользователь не найден', HttpStatus.NOT_FOUND);
    }

    const role = await this.roleModel.findOne({
      where: { value: roleValue }
    });

    if (!role) {
      throw new HttpException(`Роль "${roleValue}" не найдена`, HttpStatus.NOT_FOUND);
    }

    const deleted = await this.userRolesModel.destroy({
      where: {
        userId: userId,
        roleId: role.id,
      }
    });

    if (deleted === 0) {
      throw new HttpException(
        `Роль "${roleValue}" не назначена пользователю`,
        HttpStatus.NOT_FOUND
      );
    }
  }

  async getUserRoles(userId: number): Promise<Role[]> {
    const user = await this.userModel.findByPk(userId, {
      include: [{ model: Role }]
    });

    if (!user) {
      throw new HttpException('Пользователь не найден', HttpStatus.NOT_FOUND);
    }

    return user.roles || [];
  }

  async findAll(): Promise<User[]> {
    return this.userModel.findAll({
      include: [
        { model: Pet },
        { model: Order },
        { model: Review },
        { model: Role },
      ],
    });
  }

  async findOne(id: number): Promise<User> {
    const user = await this.userModel.findByPk(id, {
      include: [
        { model: Pet },
        { model: Order },
        { model: Review },
        { model: Role },
      ],
    });

    if (!user) {
      throw new HttpException('Пользователь не найден', HttpStatus.NOT_FOUND);
    }

    return user;
  }

  async getUsersByEmail(email: string): Promise<User | null> {
    const user = await this.userModel.findOne({
      where: { email },
      include: [
        { model: Pet },
        { model: Order },
        { model: Review },
        { model: Role },
      ],
    });

    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);
    await user.update(updateUserDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const user = await this.findOne(id);
    await user.destroy();
  }
}