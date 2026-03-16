import { Column, DataType, Model, Table, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../users/users.model';
import { Breed } from '../breeds/breeds.model';

@Table({ tableName: 'pets', timestamps: false })
export class Pet extends Model<Pet> {
  @ApiProperty({ example: '1', description: 'Уникальный идентификатор' })
  @Column({ type: DataType.INTEGER, autoIncrement: true, primaryKey: true })
  declare id: number;

  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER, allowNull: false })
  declare user_id: number;

  @ForeignKey(() => Breed)
  @Column({ type: DataType.INTEGER, allowNull: false })
  declare breed_id: number;

  @ApiProperty({ example: 'Шарик', description: 'Кличка' })
  @Column({ type: DataType.STRING, allowNull: false })
  declare name: string;

  @ApiProperty({ example: '2020-01-01', description: 'Дата рождения' })
  @Column({ type: DataType.DATEONLY, allowNull: false })
  declare birth_date: Date;

  @ApiProperty({ example: '15.5', description: 'Вес' })
  @Column({ type: DataType.DECIMAL(5,2) })
  declare weight: number;

  @ApiProperty({ example: 'male', description: 'Пол' })
  @Column({ type: DataType.STRING })
  declare gender: string;

  @ApiProperty({ example: 'Особые приметы...', description: 'Заметки' })
  @Column({ type: DataType.TEXT })
  declare notes: string;

  @BelongsTo(() => User)
  user: User;

  @BelongsTo(() => Breed)
  breed: Breed;
}