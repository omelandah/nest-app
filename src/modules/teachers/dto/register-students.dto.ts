import {
  IsEmail,
  IsNotEmpty,
  IsArray,
  ArrayNotEmpty,
  ArrayUnique,
} from 'class-validator';

export class RegisterStudentsDto {
  @IsEmail()
  @IsNotEmpty()
  teacher: string;

  @IsArray()
  @ArrayNotEmpty()
  @ArrayUnique()
  @IsEmail({}, { each: true })
  students: string[];
}
