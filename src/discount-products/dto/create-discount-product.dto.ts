import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class CreateDiscountProductDto {
  @ApiProperty({ example: 1, description: 'ID скидки' })
  @IsNumber()
  discount_id: number;

  @ApiProperty({ example: 1, description: 'ID товара' })
  @IsNumber()
  product_id: number;
}