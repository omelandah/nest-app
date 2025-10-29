import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { NormalizeEmailMiddleware } from 'src/middlewares/normalize-email.middleware';
import { StudentsModule } from '../students/students.module';
import { TeachersController } from './teachers.controller';
import { TeachersService } from './teachers.service';

@Module({
  providers: [TeachersService],
  controllers: [TeachersController],
  exports: [TeachersService],
  imports: [StudentsModule],
})
export class TeachersModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply((req: Request, res: Response, next: NextFunction) =>
        new NormalizeEmailMiddleware(['teacher', 'student', 'students']).use(
          req,
          res,
          next,
        ),
      )
      .forRoutes(TeachersController);
  }
}
