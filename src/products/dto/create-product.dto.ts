import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsBoolean, IsOptional, Min } from 'class-validator';

export class CreateProductDto {
  @ApiProperty({ example: 'RC-12345', description: 'Артикул' })
  @IsString()
  sku: string;

  @ApiProperty({ example: 'Корм Royal Canin для щенков', description: 'Название' })
  @IsString()
  name: string;

  @ApiProperty({ example: 1, description: 'ID категории' })
  @IsNumber()
  category_id: number;

  @ApiProperty({ example: 1, description: 'ID бренда', required: false })
  @IsNumber()
  @IsOptional()
  brand_id?: number;

  @ApiProperty({ example: 1500.00, description: 'Цена' })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ example: 50, description: 'Количество на складе', required: false })
  @IsNumber()
  @Min(0)
  @IsOptional()
  stock?: number;

  @ApiProperty({ example: true, description: 'Активен ли товар', required: false })
  @IsBoolean()
  @IsOptional()
  is_active?: boolean;

  @ApiProperty({ example: 'Полное описание товара...', description: 'Описание', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 'Мясо, злаки...', description: 'Состав', required: false })
  @IsString()
  @IsOptional()
  ingredients?: string;
}