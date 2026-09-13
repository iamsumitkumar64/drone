import { Module } from '@nestjs/common';
import { RegisterUserController } from './register-user.controller.js';
import { RegisterUserHandler } from './register-user.handler.js';
import { JwtHelperService } from '../../../infrastructure/service/jwt/jwt.service.js';
import { UserRepository } from '../../../infrastructure/repository/user-repository/user-repository.js';
import { BcryptService } from '../../../infrastructure/service/bcrypt/bcrypt.service.js';
import { CookieService } from '../../../infrastructure/service/cookie/cookie.service.js';

@Module({
  imports: [],
  controllers: [RegisterUserController],
  providers: [JwtHelperService, UserRepository, RegisterUserHandler, BcryptService, CookieService],
  exports: [],
})
export class RegisterUserModule { }
