import { Test, TestingModule } from '@nestjs/testing';
import { TeachersController } from '../teachers.controller';
import { TeachersService } from '../teachers.service';
import { BadRequestException } from '@nestjs/common';
import { CommonStudentDto } from '../dto/common-students.dto';
import { RegisterStudentsDto } from '../dto/register-students.dto';
import { RetrieveNotiDto } from '../dto/retrieve-noti.dto';
import { SuspendStudentDto } from '../dto/suspend-student.dto';

describe('TeachersController', () => {
  let controller: TeachersController;
  let service: jest.Mocked<TeachersService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TeachersController],
      providers: [
        {
          provide: TeachersService,
          useValue: {
            registerStudents: jest.fn(),
            getCommonStudents: jest.fn(),
            suspendStudent: jest.fn(),
            retrieveNotificationRecipients: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<TeachersController>(TeachersController);
    service = module.get(TeachersService);
  });

  describe('registerStudents', () => {
    it('should call service.registerStudents with correct params', async () => {
      const dto: RegisterStudentsDto = {
        teacher: 'teacher@mail.com',
        students: ['s1@mail.com', 's2@mail.com'],
      };

      await controller.registerStudents(dto);

      expect(service.registerStudents).toHaveBeenCalledWith(
        dto.teacher,
        dto.students,
      );
    });
  });

  describe('getCommonStudents', () => {
    it('should return result from service.getCommonStudents', async () => {
      const query: CommonStudentDto = { teacher: ['a@mail.com', 'b@mail.com'] };
      const expected = ['x@mail.com'];
      service.getCommonStudents.mockResolvedValue(expected);

      const result = await controller.getCommonStudents(query);

      expect(result).toEqual(expected);
      expect(service.getCommonStudents).toHaveBeenCalledWith(query.teacher);
    });
  });

  describe('suspendStudent', () => {
    it('should call service.suspendStudent with correct email', async () => {
      const dto: SuspendStudentDto = { student: 's1@mail.com' };
      await controller.suspendStudent(dto);

      expect(service.suspendStudent).toHaveBeenCalledWith(dto.student);
    });
  });

  describe('retrieveForNotifications', () => {
    it('should throw BadRequestException if teacher or notification missing', async () => {
      const dto = { teacher: '', notification: '' } as RetrieveNotiDto;

      await expect(controller.retrieveForNotifications(dto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should return recipients from service', async () => {
      const dto: RetrieveNotiDto = {
        teacher: 'teacher@mail.com',
        notification: 'Hello @student@mail.com',
      };

      const expectedRecipients = ['student@mail.com'];
      service.retrieveNotificationRecipients.mockResolvedValue(
        expectedRecipients,
      );

      const result = await controller.retrieveForNotifications(dto);

      expect(result).toEqual({ recipients: expectedRecipients });
      expect(service.retrieveNotificationRecipients).toHaveBeenCalledWith(
        dto.teacher,
        dto.notification,
      );
    });
  });
});
