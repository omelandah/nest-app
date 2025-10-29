import { Test, TestingModule } from '@nestjs/testing';
import { StudentsService } from '../students.service';
import { PrismaService } from '../../../database/prisma.service';
import { Student } from '@prisma/client';

describe('StudentsService', () => {
  let service: StudentsService;
  let prisma: jest.Mocked<PrismaService>;

  const mockStudents: Student[] = [
    {
      id: '1',
      email: 'student1@mail.com',
      isSuspended: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '2',
      email: 'student2@mail.com',
      isSuspended: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StudentsService,
        {
          provide: PrismaService,
          useValue: {
            student: {
              findUnique: jest.fn(),
              findMany: jest.fn(),
              update: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<StudentsService>(StudentsService);
    prisma = module.get(PrismaService);
  });

  describe('findByEmail', () => {
    it('should return a student by email', async () => {
      prisma.student.findUnique.mockResolvedValue(mockStudents[0]);

      const result = await service.findByEmail('student1@mail.com');

      expect(result).toEqual(mockStudents[0]);
      expect(prisma.student.findUnique).toHaveBeenCalledWith({
        where: { email: 'student1@mail.com' },
      });
    });
  });

  describe('findByEmails', () => {
    it('should return a list of students by emails', async () => {
      prisma.student.findMany.mockResolvedValue(mockStudents);

      const emails = ['student1@mail.com', 'student2@mail.com'];
      const result = await service.findByEmails(emails);

      expect(result).toEqual(mockStudents);
      expect(prisma.student.findMany).toHaveBeenCalledWith({
        where: { email: { in: emails } },
      });
    });
  });

  describe('findNotSuspendedStudentByEmails', () => {
    it('should return only non-suspended students', async () => {
      prisma.student.findMany.mockResolvedValue([mockStudents[0]]);

      const emails = ['student1@mail.com', 'student2@mail.com'];
      const result = await service.findNotSuspendedStudentByEmails(emails);

      expect(result).toEqual([mockStudents[0]]);
      expect(prisma.student.findMany).toHaveBeenCalledWith({
        where: {
          email: { in: emails },
          isSuspended: false,
        },
      });
    });
  });

  describe('suspendStudent', () => {
    it('should update student isSuspended to true', async () => {
      const updatedStudent = { ...mockStudents[0], isSuspended: true };
      prisma.student.update.mockResolvedValue(updatedStudent);

      const result = await service.suspendStudent('student1@mail.com');

      expect(result).toEqual(updatedStudent);
      expect(prisma.student.update).toHaveBeenCalledWith({
        where: { email: 'student1@mail.com' },
        data: { isSuspended: true },
      });
    });
  });
});
