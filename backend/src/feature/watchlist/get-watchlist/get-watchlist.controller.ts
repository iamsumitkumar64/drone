import { Controller, Get, Query } from '@nestjs/common';
import { GetWatchlistHandler } from './get-watchlist.handler.js';
import { PublicAuthenticate } from '../../../infrastructure/decorator/public-authenticate/public-authenticate.decorator.js';
import { CurrentUser } from '../../../infrastructure/decorator/current-user/current-user.decorator.js';
import { UserEntity } from '../../../domain/user/user.entity.js';

@Controller('/watchlist')
export class GetWatchlistController {
  constructor(private readonly getWatchlistHandler: GetWatchlistHandler) {}

  @PublicAuthenticate()
  @Get()
  async getWatchlist(
    @CurrentUser() user?: UserEntity,
    @Query('userId') queryUserId?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    const activeUserId = user?.uuid || queryUserId || 'default-user';
    const result = await this.getWatchlistHandler.handle(
      activeUserId,
      page ? Number(page) : 1,
      limit ? Number(limit) : 10,
    );
    return {
      message: 'Watchlist fetched successfully',
      ...result,
    };
  }
}
