import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class CreateRepositoryDto {
  @ApiProperty({ example: 'Склад №1', description: 'Название склада' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'г. Москва, ул. Складская, д.1', description: 'Адрес склада', required: false })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiProperty({ example: '+79001234567', description: 'Контактный телефон', required: false })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ example: true, description: 'Активен ли склад', required: false })
  @IsBoolean()
  @IsOptional()
  is_active?: boolean;
}