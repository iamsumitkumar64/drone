import { Controller, Get, Query } from '@nestjs/common';
import { GetHistoryHandler } from './get-history.handler.js';
import { PublicAuthenticate } from '../../../infrastructure/decorator/public-authenticate/public-authenticate.decorator.js';

@Controller('/monitoring')
export class GetHistoryController {
  constructor(private readonly getHistoryHandler: GetHistoryHandler) {}

  @PublicAuthenticate()
  @Get('history')
  async getHistory(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    const result = await this.getHistoryHandler.handle(
      page ? Number(page) : 1,
      limit ? Number(limit) : 10,
    );
    return {
      message: 'Stock history retrieved successfully',
      ...result,
    };
  }
}
