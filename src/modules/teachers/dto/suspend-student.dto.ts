import { IsEmail, IsNotEmpty } from 'class-validator';

export class SuspendStudentDto {
  @IsEmail()
  @IsNotEmpty()
  student: string;
}
