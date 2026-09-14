import { Controller, Delete, Param, Query } from '@nestjs/common';
import { RemoveFromWatchlistHandler } from './remove-from-watchlist.handler.js';
import { PublicAuthenticate } from '../../../infrastructure/decorator/public-authenticate/public-authenticate.decorator.js';
import { CurrentUser } from '../../../infrastructure/decorator/current-user/current-user.decorator.js';
import { UserEntity } from '../../../domain/user/user.entity.js';

@Controller('/watchlist')
export class RemoveFromWatchlistController {
  constructor(private readonly removeFromWatchlistHandler: RemoveFromWatchlistHandler) {}

  @PublicAuthenticate()
  @Delete(':productUuid')
  async removeFromWatchlist(
    @Param('productUuid') productUuid: string,
    @CurrentUser() user?: UserEntity,
    @Query('userId') queryUserId?: string,
  ) {
    const activeUserId = user?.uuid || queryUserId || 'default-user';
    return await this.removeFromWatchlistHandler.handle(productUuid, activeUserId);
  }
}
