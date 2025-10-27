import { Injectable } from '@nestjs/common';

@Injectable()
export class TeachersService {
  getCommonStudents(): string {
    return 'Teacher Service';
  }
}
