import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class CreateOrderStatusDto {
  @ApiProperty({ example: 'pending', description: 'Название статуса' })
  @IsString()
  status_name: string;

  @ApiProperty({ example: 'Заказ ожидает обработки', description: 'Описание', required: false })
  @IsString()
  @IsOptional()
  description?: string;
}