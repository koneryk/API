import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional } from 'class-validator';

export class CreateBreedDto {
  @ApiProperty({ example: 1, description: 'ID вида животного' })
  @IsNumber()
  species_id: number;

  @ApiProperty({ example: 'Лабрадор', description: 'Название породы' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'Описание породы...', description: 'Описание', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 'large', description: 'Размер', required: false })
  @IsString()
  @IsOptional()
  size?: string;
}