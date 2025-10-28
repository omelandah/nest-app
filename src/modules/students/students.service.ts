import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { Student } from '@prisma/client';

@Injectable()
export class StudentsService {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string): Promise<Student | null> {
    return this.prisma.student.findUnique({ where: { email } });
  }

  async findByEmails(emails: string[]): Promise<Student[]> {
    return this.prisma.student.findMany({
      where: { email: { in: emails } },
    });
  }

  async findNotSuspendedStudentByEmails(emails: string[]): Promise<Student[]> {
    return this.prisma.student.findMany({
      where: {
        email: { in: emails },
        isSuspended: false,
      },
    });
  }

  async suspendStudent(email: string): Promise<Student> {
    return this.prisma.student.update({
      where: { email },
      data: { isSuspended: true },
    });
  }
}
