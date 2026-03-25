import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsDate, IsBoolean, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateDiscountDto {
  @ApiProperty({ example: 'SUMMER10', description: 'Код скидки' })
  @IsString()
  code: string;

  @ApiProperty({ example: 'Летняя скидка', description: 'Название' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'percentage', description: 'Тип скидки' })
  @IsString()
  type: string;

  @ApiProperty({ example: 10.00, description: 'Значение скидки' })
  @IsNumber()
  value: number;

  @ApiProperty({ example: 1000.00, description: 'Мин. сумма заказа', required: false })
  @IsNumber()
  @IsOptional()
  min_order?: number;

  @ApiProperty({ example: '2026-03-01', description: 'Дата начала' })
  @Type(() => Date)
  @IsDate()
  start_date: Date;

  @ApiProperty({ example: '2026-04-01', description: 'Дата окончания' })
  @Type(() => Date)
  @IsDate()
  end_date: Date;

  @ApiProperty({ example: true, description: 'Активна ли скидка', required: false })
  @IsBoolean()
  @IsOptional()
  is_active?: boolean;
}