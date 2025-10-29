import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { TeachersService } from '../teachers.service';
import { PrismaService } from '../../../database/prisma.service';
import { StudentsService } from '../../students/students.service';
// import { getMentionedEmails } from 'src/utils/common';
import { getMentionedEmails } from '../../../utils/common';

jest.mock('../../../utils/common', () => ({
  getMentionedEmails: jest.fn(),
}));

describe('TeachersService', () => {
  let service: TeachersService;
  let prisma: jest.Mocked<PrismaService>;
  let studentsService: jest.Mocked<StudentsService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TeachersService,
        {
          provide: PrismaService,
          useValue: {
            teacher: {
              findUnique: jest.fn(),
              findMany: jest.fn(),
            },
            studentTeacher: {
              upsert: jest.fn(),
            },
          },
        },
        {
          provide: StudentsService,
          useValue: {
            findByEmail: jest.fn(),
            findByEmails: jest.fn(),
            suspendStudent: jest.fn(),
            findNotSuspendedStudentByEmails: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<TeachersService>(TeachersService);
    prisma = module.get(PrismaService);
    studentsService = module.get(StudentsService);
  });

  describe('registerStudents', () => {
    it('should throw BadRequestException if teacherEmail or studentEmails are missing', async () => {
      await expect(service.registerStudents('', [])).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw NotFoundException if teacher not found', async () => {
      prisma.teacher.findUnique.mockResolvedValue(null);

      await expect(
        service.registerStudents('teacher@mail.com', ['s1@mail.com']),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if some students not found', async () => {
      prisma.teacher.findUnique.mockResolvedValue({
        id: 't1',
        email: 'teacher@mail.com',
      } as any);
      studentsService.findByEmails.mockResolvedValue([
        { email: 's1@mail.com', id: 's1' } as any,
      ]);

      await expect(
        service.registerStudents('teacher@mail.com', [
          's1@mail.com',
          's2@mail.com',
        ]),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw InternalServerErrorException if student is suspended', async () => {
      prisma.teacher.findUnique.mockResolvedValue({
        id: 't1',
        email: 'teacher@mail.com',
      } as any);
      studentsService.findByEmails.mockResolvedValue([
        { email: 's1@mail.com', id: 's1', isSuspended: true } as any,
      ]);

      await expect(
        service.registerStudents('teacher@mail.com', ['s1@mail.com']),
      ).rejects.toThrow(InternalServerErrorException);
    });

    it('should upsert records for valid inputs', async () => {
      prisma.teacher.findUnique.mockResolvedValue({
        id: 't1',
        email: 'teacher@mail.com',
      } as any);
      studentsService.findByEmails.mockResolvedValue([
        { email: 's1@mail.com', id: 's1', isSuspended: false } as any,
      ]);

      await service.registerStudents('teacher@mail.com', ['s1@mail.com']);
      expect(prisma.studentTeacher.upsert).toHaveBeenCalled();
    });
  });

  describe('getCommonStudents', () => {
    it('should throw BadRequestException if empty input', async () => {
      await expect(service.getCommonStudents([])).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw NotFoundException if some teachers missing', async () => {
      prisma.teacher.findMany.mockResolvedValue([
        { email: 't1@mail.com', studentLinks: [] } as any,
      ]);

      await expect(
        service.getCommonStudents(['t1@mail.com', 't2@mail.com']),
      ).rejects.toThrow(NotFoundException);
    });

    it('should return common students', async () => {
      prisma.teacher.findMany.mockResolvedValue([
        {
          email: 't1@mail.com',
          studentLinks: [{ student: { email: 'a@mail.com' } }],
        },
        {
          email: 't2@mail.com',
          studentLinks: [{ student: { email: 'a@mail.com' } }],
        },
      ] as any);

      const result = await service.getCommonStudents([
        't1@mail.com',
        't2@mail.com',
      ]);
      expect(result).toEqual(['a@mail.com']);
    });
  });

  describe('suspendStudent', () => {
    it('should throw NotFoundException if student not found', async () => {
      studentsService.findByEmail.mockResolvedValue(null);
      await expect(service.suspendStudent('x@mail.com')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should not suspend if already suspended', async () => {
      studentsService.findByEmail.mockResolvedValue({
        email: 'x@mail.com',
        isSuspended: true,
      } as any);

      await service.suspendStudent('x@mail.com');
      expect(studentsService.suspendStudent).not.toHaveBeenCalled();
    });

    it('should suspend valid student', async () => {
      studentsService.findByEmail.mockResolvedValue({
        email: 'x@mail.com',
        isSuspended: false,
      } as any);

      await service.suspendStudent('x@mail.com');
      expect(studentsService.suspendStudent).toHaveBeenCalledWith('x@mail.com');
    });
  });

  describe('retrieveNotificationRecipients', () => {
    it('should throw NotFoundException if teacher not found', async () => {
      prisma.teacher.findUnique.mockResolvedValue(null);
      await expect(
        service.retrieveNotificationRecipients('t@mail.com', 'hello'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should return active registered + mentioned students', async () => {
      prisma.teacher.findUnique.mockResolvedValue({
        email: 't@mail.com',
        studentLinks: [{ student: { email: 's1@mail.com' } }],
      } as any);

      (getMentionedEmails as jest.Mock).mockReturnValue(['s2@mail.com']);
      studentsService.findByEmails.mockResolvedValue([
        { email: 's2@mail.com', id: 's2' } as any,
      ]);
      studentsService.findNotSuspendedStudentByEmails.mockResolvedValue([
        { email: 's1@mail.com' },
        { email: 's2@mail.com' },
      ] as any);

      const result = await service.retrieveNotificationRecipients(
        't@mail.com',
        'hello @s2@mail.com',
      );

      expect(result).toEqual(['s1@mail.com', 's2@mail.com']);
    });
  });
});
