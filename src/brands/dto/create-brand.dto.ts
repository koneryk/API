import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsUrl } from 'class-validator';

export class CreateBrandDto {
  @ApiProperty({ example: 'Royal Canin', description: 'Название бренда' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'Производитель кормов...', description: 'Описание', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 'https://example.com/logo.png', description: 'Логотип', required: false })
  @IsUrl()
  @IsOptional()
  logo_url?: string;
}