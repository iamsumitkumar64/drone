import { Controller, Post, Body } from '@nestjs/common';
import { AddToWatchlistHandler } from './add-to-watchlist.handler.js';
import { AddToWatchlistDto } from './add-to-watchlist.dto.js';
import { PublicAuthenticate } from '../../../infrastructure/decorator/public-authenticate/public-authenticate.decorator.js';
import { CurrentUser } from '../../../infrastructure/decorator/current-user/current-user.decorator.js';
import { UserEntity } from '../../../domain/user/user.entity.js';

@Controller('/watchlist')
export class AddToWatchlistController {
  constructor(private readonly addToWatchlistHandler: AddToWatchlistHandler) {}

  @PublicAuthenticate()
  @Post()
  async addToWatchlist(
    @Body() body: AddToWatchlistDto,
    @CurrentUser() user?: UserEntity,
  ) {
    const activeUserId = user?.uuid || body.userId || 'default-user';
    const result = await this.addToWatchlistHandler.handle(body, activeUserId);
    return {
      message: result.alreadyExists ? 'Product already in watchlist' : 'Product added to watchlist successfully',
      data: result.item,
    };
  }
}
