import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, IsOptional } from 'class-validator';

export class CreateProductCharacteristicDto {
  @ApiProperty({ example: 1, description: 'ID товара' })
  @IsNumber()
  product_id: number;

  @ApiProperty({ example: 1, description: 'ID характеристики' })
  @IsNumber()
  characteristic_id: number;

  @ApiProperty({ example: '2.5', description: 'Значение', required: false })
  @IsString()
  @IsOptional()
  value?: string;
}
