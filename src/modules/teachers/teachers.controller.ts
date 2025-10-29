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
import { CommonStudentDto } from './dto/common-students.dto';
import { RegisterStudentsDto } from './dto/register-students.dto';
import { RetrieveNotiDto } from './dto/retrieve-noti.dto';
import { SuspendStudentDto } from './dto/suspend-student.dto';
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
  async getCommonStudents(@Query() query: CommonStudentDto): Promise<string[]> {
    return this.teachersService.getCommonStudents(query.teacher);
  }

  @Post('suspend')
  @HttpCode(HttpStatus.NO_CONTENT)
  async suspendStudent(@Body() dto: SuspendStudentDto): Promise<void> {
    await this.teachersService.suspendStudent(dto.student);
  }

  @Post('retrievefornotifications')
  @HttpCode(HttpStatus.OK)
  async retrieveForNotifications(
    @Body() dto: RetrieveNotiDto,
  ): Promise<{ recipients: string[] }> {
    const { teacher, notification } = dto;

    if (!teacher || !notification) {
      throw new BadRequestException(
        'Teacher email and notification text are required.',
      );
    }

    const recipients =
      await this.teachersService.retrieveNotificationRecipients(
        teacher,
        notification,
      );

    return { recipients };
  }
}
