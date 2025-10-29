import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class NormalizeEmailMiddleware implements NestMiddleware {
  private fields: string[];
  constructor(fields: string[]) {
    this.fields = fields;
  }

  use(req: Request, res: Response, next: NextFunction) {
    if (req.body) {
      this.fields.forEach((key) => {
        const value = req.body[key];

        if (typeof value === 'string') {
          req.body[key] = value.trim().toLowerCase();
        } else if (Array.isArray(value)) {
          req.body[key] = value.map((email) =>
            typeof email === 'string' ? email.trim().toLowerCase() : email,
          );
        }
      });
    }

    if (req.query) {
      this.fields.forEach((key) => {
        const value = req.query[key];

        if (typeof value === 'string') {
          req.query[key] = value.trim().toLowerCase();
        } else if (Array.isArray(value)) {
          req.query[key] = value.map((email) =>
            typeof email === 'string' ? email.trim().toLowerCase() : email,
          );
        }
      });
    }

    next();
  }
}
