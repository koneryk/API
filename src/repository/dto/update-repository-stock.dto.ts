import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, Min, IsString } from 'class-validator';

export class UpdateRepositoryStockDto {
  @ApiProperty({ example: 150, description: 'Новое количество' })
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