import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, Min, IsOptional } from 'class-validator';

export class AddToCartDto {
  @ApiProperty({ example: 1, description: 'ID товара' })
  @IsNumber()
  product_id: number;

  @ApiProperty({ example: 2, description: 'Количество', required: false })
  @IsNumber()
  @Min(1)
  @IsOptional()
  quantity?: number;
}