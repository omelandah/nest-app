import { Controller, Get } from '@nestjs/common';
import { TeachersService } from './teachers.service';

@Controller('')
export class TeachersController {
  constructor(private readonly teachersService: TeachersService) {}

  @Get('/teacher')
  getCommonStudents(): string {
    console.log('Teacher Controller');
    return this.teachersService.getCommonStudents();
  }
}
