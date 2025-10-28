import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class RetrieveNotiDto {
  @IsEmail()
  @IsNotEmpty()
  teacher: string;

  @IsString()
  @IsNotEmpty()
  notification: string;
}
