import {
  BelongsTo,
  BelongsToMany,
  Column,
  DataType, ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { ApiProperty } from '@nestjs/swagger';
import { Role } from '../roles/roles.model';
import { UserRoles } from '../roles/user-roles.model';
import { User } from '../users/users.model';

interface PostCreationAttr {
  title: string;
  content: string;
  userId: number;
  image: string;
}
@Table({ tableName: 'posts' })
export class Post extends Model<Post, PostCreationAttr> {
  @Column({
    type: DataType.INTEGER,
    unique: true,
    autoIncrement: true,
    primaryKey: true,
  })
  declare id: number;
  @Column({ type: DataType.STRING, unique: true, allowNull: false })
  declare title: string;
  @Column({ type: DataType.STRING, allowNull: false })
  declare content: string;
  @Column({ type: DataType.STRING})
  declare image: string;
  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER})
  userId: number;

  @BelongsTo(() => User)
  author: User;
}
