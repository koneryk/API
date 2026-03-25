import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Корма для собак', description: 'Название категории' })
  @IsString()
  name: string;

  @ApiProperty({ example: 1, description: 'ID родительской категории', required: false })
  @IsNumber()
  @IsOptional()
  parent_id?: number;

  @ApiProperty({ example: 'Все корма для собак...', description: 'Описание', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 'https://example.com/cat.jpg', description: 'Изображение', required: false })
  @IsString()
  @IsOptional()
  image_url?: string;
}