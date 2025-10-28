import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { StudentsService } from '../students/students.service';
import { Teacher } from '@prisma/client';

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

    // Check for suspended students
    const suspendedStudents = students.filter((s) => s.isSuspended);
    if (suspendedStudents.length > 0) {
      const suspendedEmails = suspendedStudents.map((s) => s.email).join(', ');
      throw new InternalServerErrorException(
        `Cannot register suspended students: ${suspendedEmails}`,
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

  // Get common students emails list of provided teachers emails
  async getCommonStudents(teacherEmails: string[]): Promise<string[]> {
    if (teacherEmails.length === 0) {
      throw new BadRequestException('At least one teacher email is required.');
    }

    const teachers = await this.prisma.teacher.findMany({
      where: { email: { in: teacherEmails } },
      include: {
        studentLinks: {
          include: { student: true },
        },
      },
    });

    const foundEmails = teachers.map((t) => t.email);
    const missing = teacherEmails.filter(
      (email) => !foundEmails.includes(email),
    );

    if (missing.length > 0) {
      throw new NotFoundException(
        `Teacher(s) not found: ${missing.join(', ')}`,
      );
    }

    // Extract student emails per teacher
    const studentLists = teachers.map(
      (t) =>
        t.studentLinks?.map(
          (link: { student: { email: string } }) => link.student.email,
        ) ?? [],
    );

    return studentLists.reduce((acc, list) =>
      acc.filter((email: string) => list.includes(email)),
    );
  }

  // Suspend a student
  async suspendStudent(studentEmail: string): Promise<void> {
    const student = await this.studentsService.findByEmail(studentEmail);
    if (!student) {
      throw new NotFoundException(`Student not found: ${studentEmail}`);
    }

    if (student.isSuspended) {
      return;
    }

    await this.studentsService.suspendStudent(studentEmail);
  }
}
