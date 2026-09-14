import { Module } from '@nestjs/common';
import { RemoveFromWatchlistController } from './remove-from-watchlist.controller.js';
import { RemoveFromWatchlistHandler } from './remove-from-watchlist.handler.js';
import { WatchlistRepository } from '../../../infrastructure/repository/watchlist-repository/watchlist.repository.js';

@Module({
  controllers: [RemoveFromWatchlistController],
  providers: [RemoveFromWatchlistHandler, WatchlistRepository],
  exports: [RemoveFromWatchlistHandler],
})
export class RemoveFromWatchlistModule {}
