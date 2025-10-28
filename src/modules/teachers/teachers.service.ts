import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { StudentsService } from '../students/students.service';

@Injectable()
export class TeachersService {
  constructor(
    private prisma: PrismaService,
    private studentsService: StudentsService,
  ) {}

  // Register existing students to existing teacher
  async registerStudents(
    teacherEmail: string,
    studentEmails: string[],
  ): Promise<void> {
    if (!teacherEmail || studentEmails.length === 0) {
      throw new BadRequestException(
        'Teacher email and students list are required.',
      );
    }

    const teacher = await this.prisma.teacher.findUnique({
      where: { email: teacherEmail },
    });

    if (!teacher) {
      throw new NotFoundException(`Teacher not found: ${teacherEmail}`);
    }

    const students = await this.studentsService.findByEmails(studentEmails);
    const foundEmails = students.map((s) => s.email);
    const missing = studentEmails.filter(
      (email) => !foundEmails.includes(email),
    );

    if (missing.length > 0) {
      throw new NotFoundException(
        `Student(s) not found: ${missing.join(', ')}`,
      );
    }

    for (const student of students) {
      await this.prisma.studentTeacher.upsert({
        where: {
          teacherId_studentId: {
            teacherId: teacher.id,
            studentId: student.id,
          },
        },
        update: {},
        create: {
          teacherId: teacher.id,
          studentId: student.id,
        },
      });
    }
  }

  async getCommonStudents(): Promise<void> {}
}
