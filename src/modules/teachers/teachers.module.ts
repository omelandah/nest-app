import { Module } from '@nestjs/common';
import { StudentsModule } from '../students/students.module';
import { TeachersController } from './teachers.controller';
import { TeachersService } from './teachers.service';

@Module({
  providers: [TeachersService],
  controllers: [TeachersController],
  exports: [TeachersService],
  imports: [StudentsModule],
})
export class TeachersModule {}
