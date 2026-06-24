import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, Min } from 'class-validator';

export class MoveStockDto {
  @ApiProperty({ example: 1, description: 'ID склада-источника' })
  @IsNumber()
  from_repository_id: number;

  @ApiProperty({ example: 2, description: 'ID склада-назначения' })
  @IsNumber()
  to_repository_id: number;

  @ApiProperty({ example: 1, description: 'ID товара' })
  @IsNumber()
  product_id: number;

  @ApiProperty({ example: 50, description: 'Количество для перемещения' })
  @IsNumber()
  @Min(1)
  quantity: number;
}