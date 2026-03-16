import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User } from './users.model';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcryptjs';
import { Pet } from '../pets/pets.model';
import { Order } from '../orders/orders.model';
import { Review } from '../reviews/reviews.model';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User)
    private userModel: typeof User,
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

    console.log('Создание пользователя с данными:', {
      ...userData,
      password_hash: '***',
    });

    const user = await this.userModel.create(userData as any);
    return user;
  }

  async findAll(): Promise<User[]> {
    return this.userModel.findAll({
      include: [
        { model: Pet },
        { model: Order },
        { model: Review },
      ],
    });
  }

  async findOne(id: number): Promise<User> {
    const user = await this.userModel.findByPk(id, {
      include: [
        { model: Pet },
        { model: Order },
        { model: Review },
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
      ],
    });

    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);
    await user.update(updateUserDto);
    return user;
  }

  async remove(id: number): Promise<void> {
    const user = await this.findOne(id);
    await user.destroy();
  }
}