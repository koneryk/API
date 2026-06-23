import { IsNumber, IsString } from 'class-validator';

export class AddRoleDTO {
  @IsNumber({}, { message: 'Должен быть числовым значением' })
  readonly userId: number;
  
  @IsString({ message: 'Должно быть строкой' })
  readonly value: string;
}