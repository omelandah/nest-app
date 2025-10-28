import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { RegisterStudentsDto } from './dto/register-students.dto';
import { TeachersService } from './teachers.service';

@Controller('')
export class TeachersController {
  constructor(private readonly teachersService: TeachersService) {}

  @Post('/register')
  @HttpCode(HttpStatus.NO_CONTENT)
  async registerStudents(@Body() dto: RegisterStudentsDto): Promise<void> {
    await this.teachersService.registerStudents(dto.teacher, dto.students);
  }

  @Get('/teacher')
  async getCommonStudents() {
    await this.teachersService.getCommonStudents();
  }
}
