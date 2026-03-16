import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { User } from '../users/users.model';

@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    private jwtService: JwtService,
  ) {}

  async login(userDto: CreateUserDto) {
    const user = await this.validateUser(userDto);
    return this.generateToken(user);
  }

  async registration(userDto: CreateUserDto) {
    const candidate = await this.userService.getUsersByEmail(userDto.email);
    if (candidate) {
      throw new HttpException(
        'Пользователь с таким email уже существует',
        HttpStatus.BAD_REQUEST
      );
    }

    const user = await this.userService.createUser(userDto);
    return this.generateToken(user);
  }

  generateToken(user: User) {
    const payload = {
      email: user.email,
      id: user.id,
      roles: user.role || 'customer'
    };

    return {
      token: this.jwtService.sign(payload),
    };
  }

  async validateUser(userDto: CreateUserDto): Promise<User> {
    const user = await this.userService.getUsersByEmail(userDto.email);

    if (!user) {
      throw new UnauthorizedException({ message: 'Неверный пароль или email' });
    }

    const passwordEquals = await bcrypt.compare(
      userDto.password,
      user.password_hash
    );

    if (passwordEquals) {
      return user;
    }

    throw new UnauthorizedException({ message: 'Неверный пароль или email' });
  }
}