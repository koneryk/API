import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, Min, IsString } from 'class-validator';

export class CreateRepositoryStockDto {
  @ApiProperty({ example: 1, description: 'ID склада' })
  @IsNumber()
  repository_id: number;

  @ApiProperty({ example: 1, description: 'ID товара' })
  @IsNumber()
  product_id: number;

  @ApiProperty({ example: 100, description: 'Количество' })
  @IsNumber()
  @Min(0)
  quantity: number;

  @ApiProperty({ example: 10, description: 'Минимальный остаток', required: false })
  @IsNumber()
  @IsOptional()
  min_stock?: number;

  @ApiProperty({ example: 'A1-2', description: 'Местоположение', required: false })
  @IsString()
  @IsOptional()
  location?: string;
}