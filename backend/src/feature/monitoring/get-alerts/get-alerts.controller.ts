import { Controller, Get, Query } from '@nestjs/common';
import { GetAlertsHandler } from './get-alerts.handler.js';
import { PublicAuthenticate } from '../../../infrastructure/decorator/public-authenticate/public-authenticate.decorator.js';

@Controller('/monitoring')
export class GetAlertsController {
  constructor(private readonly getAlertsHandler: GetAlertsHandler) {}

  @PublicAuthenticate()
  @Get('alerts')
  async getAlerts(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    const result = await this.getAlertsHandler.handle(
      page ? Number(page) : 1,
      limit ? Number(limit) : 10,
    );
    return {
      message: 'Alerts retrieved successfully',
      ...result,
    };
  }
}
