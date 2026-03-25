import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class OrderItemDto {
  @ApiProperty()
  @IsNumber()
  product_id: number;

  @ApiProperty()
  @IsNumber()
  quantity: number;

  @ApiProperty()
  @IsNumber()
  price: number;
}

export class CreateOrderDto {
  @ApiProperty({ example: 1, description: 'ID статуса' })
  @IsNumber()
  status_id: number;

  @ApiProperty({ example: 1, description: 'ID скидки', required: false })
  @IsNumber()
  @IsOptional()
  discount_id?: number;

  @ApiProperty({ example: 3500.00, description: 'Общая сумма' })
  @IsNumber()
  total_amount: number;

  @ApiProperty({ example: 'г. Москва, ул. Ленина...', description: 'Адрес доставки' })
  @IsString()
  shipping_address: string;

  @ApiProperty({ example: 'card', description: 'Способ оплаты', required: false })
  @IsString()
  @IsOptional()
  payment_method?: string;

  @ApiProperty({ type: [OrderItemDto], description: 'Позиции заказа' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];
}