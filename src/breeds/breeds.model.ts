import { Column, DataType, Model, Table, ForeignKey, BelongsTo, HasMany } from 'sequelize-typescript';
import { ApiProperty } from '@nestjs/swagger';
import { Species } from '../species/species.model';
import { Pet } from '../pets/pets.model';

@Table({ tableName: 'breeds', timestamps: false })
export class Breed extends Model<Breed> {
  @ApiProperty({ example: '1', description: 'Уникальный идентификатор' })
  @Column({ type: DataType.INTEGER, autoIncrement: true, primaryKey: true })
  declare id: number;

  @ForeignKey(() => Species)
  @Column({ type: DataType.INTEGER, allowNull: false })
  declare species_id: number;

  @ApiProperty({ example: 'Лабрадор', description: 'Название породы' })
  @Column({ type: DataType.STRING, allowNull: false })
  declare name: string;

  @ApiProperty({ example: 'Описание породы...', description: 'Описание' })
  @Column({ type: DataType.TEXT })
  declare description: string;

  @ApiProperty({ example: 'large', description: 'Размер' })
  @Column({ type: DataType.STRING })
  declare size: string;

  @BelongsTo(() => Species)
  species: Species;

  @HasMany(() => Pet)
  pets: Pet[];
}