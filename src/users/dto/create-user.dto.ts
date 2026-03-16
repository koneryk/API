import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, Length, IsOptional } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ example: 'user@mail.ru', description: 'Почта' })
  @IsString({ message: 'Должно быть строкой' })
  @IsEmail({}, { message: 'Некорректный email' })
  readonly email: string;

  @ApiProperty({ example: '12345', description: 'Пароль' })
  @IsString({ message: 'Должно быть строкой' })
  @Length(4, 16, { message: 'Не менее 4 и не более 16' })
  readonly password: string;

  @ApiProperty({ example: 'Иван', description: 'Имя', required: false })
  @IsString({ message: 'Должно быть строкой' })
  @IsOptional()
  readonly first_name?: string;

  @ApiProperty({ example: 'Иванов', description: 'Фамилия', required: false })
  @IsString({ message: 'Должно быть строкой' })
  @IsOptional()
  readonly last_name?: string;

  @ApiProperty({ example: '+79001234567', description: 'Телефон', required: false })
  @IsString({ message: 'Должно быть строкой' })
  @IsOptional()
  readonly phone?: string;

  @ApiProperty({ example: 'г. Москва, ул. Ленина, д.10', description: 'Адрес', required: false })
  @IsString({ message: 'Должно быть строкой' })
  @IsOptional()
  readonly address?: string;
}