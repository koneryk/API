import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsDate, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePetDto {
  @ApiProperty({ example: 1, description: 'ID породы' })
  @IsNumber()
  breed_id: number;

  @ApiProperty({ example: 'Шарик', description: 'Кличка' })
  @IsString()
  name: string;

  @ApiProperty({ example: '2020-01-01', description: 'Дата рождения' })
  @Type(() => Date)
  @IsDate()
  birth_date: Date;

  @ApiProperty({ example: 15.5, description: 'Вес', required: false })
  @IsNumber()
  @IsOptional()
  weight?: number;

  @ApiProperty({ example: 'male', description: 'Пол', required: false })
  @IsString()
  @IsOptional()
  gender?: string;

  @ApiProperty({ example: 'Особые приметы...', description: 'Заметки', required: false })
  @IsString()
  @IsOptional()
  notes?: string;
}