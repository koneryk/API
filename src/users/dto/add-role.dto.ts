import { IsNumber, IsString } from 'class-validator';

export class AddRoleDTO {
  @IsString({ message: 'Должно быть строкой' })
  readonly userId: number;
  @IsNumber({}, { message: 'Должен быть числовым значением' })
  readonly value: string;
}
