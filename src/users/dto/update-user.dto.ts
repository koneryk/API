import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEmail } from 'class-validator';

export class UpdateUserDto {
  @ApiProperty({ example: 'user@mail.ru', description: 'Почта', required: false })
  @IsEmail({}, { message: 'Некорректный email' })
  @IsOptional()
  readonly email?: string;

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