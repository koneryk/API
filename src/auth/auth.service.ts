import { 
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException
} from '@nestjs/common';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { User } from '../users/users.model';
import { InjectModel } from '@nestjs/sequelize';
import { Role } from '../roles/roles.model';

@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    private jwtService: JwtService,
    @InjectModel(User) private userModel: typeof User,
    @InjectModel(Role) private roleModel: typeof Role,
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
    
    const isAdmin = userDto.email.toLowerCase().includes('admin');
    const roleValue = isAdmin ? 'ADMIN' : 'customer';
    
    console.log(`Назначение роли "${roleValue}" пользователю ${userDto.email}`);
    
    await this.userService.assignRole(user.id, roleValue);
    
    const userWithRoles = await this.userModel.findByPk(user.id, {
      include: [{ model: Role }],
    });
    
    if (!userWithRoles) {
      throw new HttpException('Пользователь не найден', HttpStatus.NOT_FOUND);
    }
    
    return this.generateToken(userWithRoles);
  }

  async generateToken(user: User) {
    console.log(`generateToken для: ${user.email} (ID: ${user.id})`);
    
    let roles: string[] = [];
    
    try {
      const [results] = await this.roleModel.sequelize?.query(`
        SELECT r.value 
        FROM roles r
        JOIN user_roles ur ON ur."roleId" = r.id
        WHERE ur."userId" = ${user.id}
      `) || [];
      
      if (results && results.length > 0) {
        roles = results.map((r: any) => r.value);
        console.log(`Загружено через SQL: ${roles.join(', ')}`);
      } else {
        console.log(`SQL не нашёл ролей для пользователя ${user.id}`);
      }
    } catch (error) {
      console.log(`SQL ошибка: ${error.message}`);
      
      try {
        const userWithRoles = await this.userModel.findByPk(user.id, {
          include: [{ model: Role }],
        });
        roles = userWithRoles?.roles?.map((r: any) => r.value) || [];
        console.log(`Загружено через Sequelize: ${roles.join(', ')}`);
      } catch (e) {
        console.log(`Sequelize ошибка: ${e.message}`);
      }
    }
    
    console.log(`Итоговые роли для токена: ${roles.join(', ') || 'ПУСТО'}`);
    
    const payload = {
      email: user.email,
      id: user.id,
      roles: roles,
    };

    return {
      token: this.jwtService.sign(payload),
    };
  }

  async validateUser(userDto: CreateUserDto): Promise<User> {
    const user = await this.userModel.findOne({
      where: { email: userDto.email },
      include: [{ model: Role }],
    });

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