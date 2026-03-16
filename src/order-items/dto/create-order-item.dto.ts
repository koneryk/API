import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, Min } from 'class-validator';

export class CreateOrderItemDto {
  @ApiProperty({ example: 1, description: 'ID заказа' })
  @IsNumber()
  order_id: number;

  @ApiProperty({ example: 1, description: 'ID товара' })
  @IsNumber()
  product_id: number;

  @ApiProperty({ example: 2, description: 'Количество' })
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiProperty({ example: 1500.00, description: 'Цена за единицу' })
  @IsNumber()
  price: number;
}