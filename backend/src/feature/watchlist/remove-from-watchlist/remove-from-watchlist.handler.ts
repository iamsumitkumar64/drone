import { Injectable } from '@nestjs/common';
import { WatchlistRepository } from '../../../infrastructure/repository/watchlist-repository/watchlist.repository.js';

@Injectable()
export class RemoveFromWatchlistHandler {
  constructor(private readonly watchlistRepository: WatchlistRepository) {}

  async handle(productUuid: string, activeUserId: string) {
    const removed = await this.watchlistRepository.removeByProductAndUser(
      activeUserId,
      productUuid,
    );
    return {
      success: removed,
      message: removed ? 'Removed from watchlist successfully' : 'Product was not in watchlist',
    };
  }
}
