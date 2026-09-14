import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service.js';
import { PublicAuthenticate } from './infrastructure/decorator/public-authenticate/public-authenticate.decorator.js';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @PublicAuthenticate()
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
