import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class CreateSpeciesDto {
  @ApiProperty({ example: 'Собаки', description: 'Название вида' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'Все породы собак', description: 'Описание', required: false })
  @IsString()
  @IsOptional()
  description?: string;
}