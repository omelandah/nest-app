import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
} from '@nestjs/common';
import { RegisterStudentsDto } from './dto/register-students.dto';
import { TeachersService } from './teachers.service';

@Controller('')
export class TeachersController {
  constructor(private readonly teachersService: TeachersService) {}

  @Post('register')
  @HttpCode(HttpStatus.NO_CONTENT)
  async registerStudents(@Body() dto: RegisterStudentsDto): Promise<void> {
    await this.teachersService.registerStudents(dto.teacher, dto.students);
  }

  @Get('commonstudents')
  @HttpCode(HttpStatus.OK)
  async getCommonStudents(
    @Query('teacher') teacherEmails: string | string[],
  ): Promise<string[]> {
    if (!teacherEmails) {
      throw new BadRequestException('At least one teacher email is required.');
    }

    const teacherArray = Array.isArray(teacherEmails)
      ? teacherEmails
      : [teacherEmails];
    return this.teachersService.getCommonStudents(teacherArray);
  }
}
