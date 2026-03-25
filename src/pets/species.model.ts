import { Column, DataType, Model, Table, HasMany } from 'sequelize-typescript';
import { ApiProperty } from '@nestjs/swagger';
import { Breed } from './breeds.model';

@Table({ tableName: 'species', timestamps: false })
export class Species extends Model<Species> {
  @ApiProperty({ example: '1', description: 'Уникальный идентификатор' })
  @Column({ type: DataType.INTEGER, autoIncrement: true, primaryKey: true })
  declare id: number;

  @ApiProperty({ example: 'Собаки', description: 'Название вида' })
  @Column({ type: DataType.STRING, unique: true, allowNull: false })
  declare name: string;

  @ApiProperty({ example: 'Все породы собак', description: 'Описание' })
  @Column({ type: DataType.TEXT })
  declare description: string;

  @HasMany(() => Breed)
  breeds: Breed[];
}