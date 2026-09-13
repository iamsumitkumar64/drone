import { Controller, HttpCode, HttpStatus, Post, Res } from '@nestjs/common';
import type { Response } from 'express';
import { CookieService } from '../../../infrastructure/service/cookie/cookie.service.js';

@Controller('/auth/logout')
export class LogOutUserController {
  constructor(private readonly cookieService: CookieService) { }

  @Post()
  @HttpCode(HttpStatus.OK)
  logoutUser(@Res({ passthrough: true }) res: Response) {
    this.cookieService.clearCookie(res, 'access_token');
    this.cookieService.clearCookie(res, 'role');
    return { message: 'Logged out successfully' };
  }
}
