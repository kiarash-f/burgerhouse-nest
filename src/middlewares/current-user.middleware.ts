import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { UsersService } from '../users/users.service';
import { User } from '../entities/user.entity';

// declare global {
//   namespace Express {
//     interface Request {
//       currentUser?: User | null;
//     }
//   }
// }

// @Injectable()
// export class CurrentUserMiddleware implements NestMiddleware {
//   constructor(private usersService: UsersService) {}

//   async use(req: Request, res: Response, next: NextFunction) {
//     const { userId } = req.session || {};
//     if (userId) {
//       const user = await this.usersService.findOne(userId);
//       if (user) {
//         req.currentUser = user;
//       }
//     }
//     next(); // don't forget to call next()
//   }
// }

//TODO:review session again in course
