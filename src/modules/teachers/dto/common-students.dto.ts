import { Transform } from 'class-transformer';
import { IsArray, ArrayNotEmpty, IsEmail } from 'class-validator';

export class CommonStudentDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsEmail({}, { each: true })
  @Transform(({ value }) =>
    (Array.isArray(value) ? value : [value]).map((e: string) =>
      e.trim().toLowerCase(),
    ),
  )
  teacher: string[];
}
