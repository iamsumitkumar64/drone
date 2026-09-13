import { Module } from '@nestjs/common';
import { LogOutUserController } from './log-out-user.controller.js';
import { CookieService } from '../../../infrastructure/service/cookie/cookie.service.js';

@Module({
  imports: [],
  controllers: [LogOutUserController],
  providers: [CookieService],
  exports: [],
})
export class LogOutUserModule { }
