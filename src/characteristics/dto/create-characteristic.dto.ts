import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateCharacteristicDto {
  @ApiProperty({
    example: 'Вес упаковки',
    description: 'Название характеристики',
  })
  @IsString()
  name: string;

  @ApiProperty({ example: 'number', description: 'Тип данных' })
  @IsString()
  type: string;
}