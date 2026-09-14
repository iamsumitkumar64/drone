import { Controller, Get } from '@nestjs/common';
import { GetStatusHandler } from './get-status.handler.js';
import { PublicAuthenticate } from '../../../infrastructure/decorator/public-authenticate/public-authenticate.decorator.js';

@Controller('/monitoring')
export class GetStatusController {
  constructor(private readonly getStatusHandler: GetStatusHandler) {}

  @PublicAuthenticate()
  @Get('status')
  async getStatus() {
    const status = await this.getStatusHandler.handle();
    return {
      message: 'Monitoring status retrieved successfully',
      status,
    };
  }
}
