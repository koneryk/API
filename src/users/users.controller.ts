import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { User } from './users.model';
import { Role } from '../roles/roles.model';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles-auth.decorator';

@ApiTags('Пользователи')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({ summary: 'Создание нового пользователя' })
  @ApiResponse({ status: 201, type: User, description: 'Пользователь создан' })
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.createUser(createUserDto);
  }

  @ApiOperation({ summary: 'Получение всех пользователей' })
  @ApiResponse({ status: 200, type: [User], description: 'Список пользователей' })
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @ApiOperation({ summary: 'Получение пользователя по ID' })
  @ApiResponse({ status: 200, type: User, description: 'Пользователь найден' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  @ApiOperation({ summary: 'Обновление пользователя' })
  @ApiResponse({ status: 200, type: User, description: 'Пользователь обновлен' })
  @Put(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @ApiOperation({ summary: 'Удаление пользователя' })
  @ApiResponse({ status: 200, description: 'Пользователь удален' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }

  @ApiOperation({ summary: 'Поиск пользователя по email' })
  @ApiResponse({ status: 200, type: User, description: 'Пользователь найден' })
  @Get('search/email')
  findByEmail(@Query('email') email: string) {
    return this.usersService.getUsersByEmail(email);
  }

  @ApiOperation({ summary: 'Назначить роль пользователю' })
  @ApiResponse({ status: 200, description: 'Роль назначена' })
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  @Post(':id/roles')
  assignRole(
    @Param('id') id: string,
    @Body('role') roleValue: string
  ) {
    return this.usersService.assignRole(+id, roleValue);
  }

  @ApiOperation({ summary: 'Удалить роль у пользователя' })
  @ApiResponse({ status: 200, description: 'Роль удалена' })
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  @Delete(':id/roles/:role')
  removeRole(
    @Param('id') id: string,
    @Param('role') roleValue: string
  ) {
    return this.usersService.removeRole(+id, roleValue);
  }

  @ApiOperation({ summary: 'Получить роли пользователя' })
  @ApiResponse({ status: 200, type: [Role], description: 'Роли пользователя' })
  @Get(':id/roles')
  getUserRoles(@Param('id') id: string) {
    return this.usersService.getUserRoles(+id);
  }
}