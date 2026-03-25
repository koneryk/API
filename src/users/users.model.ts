import { Column, DataType, Model, Table, HasMany, BelongsToMany } from 'sequelize-typescript';
import { ApiProperty } from '@nestjs/swagger';
import { Pet } from '../pets/pets.model';
import { Order } from '../orders/orders.model';
import { Review } from '../reviews/reviews.model';
import { Wishlist } from '../wishlists/wishlists.model';
import { Role } from '../roles/roles.model';
import { UserRoles } from '../roles/user-roles.model';

interface UserCreationAttr {
  email: string;
  password_hash: string;
  first_name: string;
  last_name: string;
  phone?: string;
  address?: string;
}

@Table({ tableName: 'users', timestamps: true, updatedAt: 'updated_at', createdAt: 'created_at' })
export class User extends Model<User, UserCreationAttr> {
  @ApiProperty({ example: '1', description: 'Уникальный идентификатор' })
  @Column({ type: DataType.INTEGER, unique: true, autoIncrement: true, primaryKey: true })
  declare id: number;

  @ApiProperty({ example: 'user@mail.ru', description: 'Почтовый адрес' })
  @Column({ type: DataType.STRING, unique: true, allowNull: false })
  declare email: string;

  @ApiProperty({ example: 'hashed_password', description: 'Хеш пароля' })
  @Column({ type: DataType.STRING, allowNull: false, field: 'password_hash' })
  declare password_hash: string;

  get password(): string {
    return this.password_hash;
  }

  set password(value: string) {
    this.password_hash = value;
  }

  @ApiProperty({ example: 'Иван', description: 'Имя' })
  @Column({ type: DataType.STRING, allowNull: false, field: 'first_name' })
  declare first_name: string;

  @ApiProperty({ example: 'Иванов', description: 'Фамилия' })
  @Column({ type: DataType.STRING, allowNull: false, field: 'last_name' })
  declare last_name: string;

  @ApiProperty({ example: '+79001234567', description: 'Телефон' })
  @Column({ type: DataType.STRING })
  declare phone: string;

  @ApiProperty({ example: 'customer', description: 'Роль' })
  @Column({ type: DataType.STRING, defaultValue: 'customer' })
  declare role: string;

  @ApiProperty({ example: 'г. Москва, ул. Ленина, д.10', description: 'Адрес' })
  @Column({ type: DataType.TEXT })
  declare address: string;

  @ApiProperty({ example: true, description: 'Активен ли пользователь' })
  @Column({ type: DataType.BOOLEAN, defaultValue: true, field: 'is_active' })
  declare is_active: boolean;

  @ApiProperty({ example: '2026-03-01 15:30:00', description: 'Последний вход' })
  @Column({ type: DataType.DATE, field: 'last_login' })
  declare last_login: Date;

  @ApiProperty({ example: '2026-03-01 10:00:00', description: 'Дата создания' })
  @Column({ type: DataType.DATE, defaultValue: DataType.NOW, field: 'created_at' })
  declare created_at: Date;

  @ApiProperty({ example: '2026-03-01 10:00:00', description: 'Дата обновления' })
  @Column({ type: DataType.DATE, defaultValue: DataType.NOW, field: 'updated_at' })
  declare updated_at: Date;


  @Column({ type: DataType.BOOLEAN, defaultValue: false })
  declare banned: boolean;

  @Column({ type: DataType.STRING })
  declare banReason: string;

  @BelongsToMany(() => Role, () => UserRoles)
  roles: Role[];

  @HasMany(() => Pet)
  pets: Pet[];

  @HasMany(() => Order)
  orders: Order[];

  @HasMany(() => Review)
  reviews: Review[];

  @HasMany(() => Wishlist)
  wishlists: Wishlist[];
}