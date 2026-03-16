import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsBoolean, IsOptional } from 'class-validator';

export class CreateProductImageDto {
  @ApiProperty({ example: 1, description: 'ID товара' })
  @IsNumber()
  product_id: number;

  @ApiProperty({ example: 'https://example.com/image.jpg', description: 'URL изображения' })
  @IsString()
  image_url: string;

  @ApiProperty({ example: true, description: 'Главное изображение', required: false })
  @IsBoolean()
  @IsOptional()
  is_primary?: boolean;
}