import { Module } from '@nestjs/common';
import { LoginUserController } from './login-user.controller.js';
import { LoginUserHandler } from './login-user.handler.js';
import { JwtHelperService } from '../../../infrastructure/service/jwt/jwt.service.js';
import { UserRepository } from '../../../infrastructure/repository/user-repository/user-repository.js';
import { BcryptService } from '../../../infrastructure/service/bcrypt/bcrypt.service.js';
import { CookieService } from '../../../infrastructure/service/cookie/cookie.service.js';

@Module({
  imports: [],
  controllers: [LoginUserController],
  providers: [JwtHelperService, UserRepository, LoginUserHandler, BcryptService, CookieService],
  exports: [],
})
export class LoginUserModule { }
