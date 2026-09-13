import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request, Response, CookieOptions } from 'express';
import * as cookie from 'cookie';

@Injectable()
export class CookieService {
  constructor(private readonly configService: ConfigService) { }

  getCookieOptions(): CookieOptions {
    const isProd = this.configService.get<string>('NODE_ENV') === 'production';
    return {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    };
  }

  setCookie(res: Response, name: string, value: string) {
    res.cookie(name, value, this.getCookieOptions());
  }

  clearCookie(res: Response, name: string) {
    res.clearCookie(name, this.getCookieOptions());
  }

  static extractFromHeader(cookieHeader: string | undefined, name: string): string | undefined {
    if (!cookieHeader) return undefined;
    return cookie.parse(cookieHeader)[name];
  }
}
