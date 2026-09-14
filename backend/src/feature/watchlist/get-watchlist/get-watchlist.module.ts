import { Module } from '@nestjs/common';
import { GetWatchlistController } from './get-watchlist.controller.js';
import { GetWatchlistHandler } from './get-watchlist.handler.js';
import { WatchlistRepository } from '../../../infrastructure/repository/watchlist-repository/watchlist.repository.js';
import { ProductRepository } from '../../../infrastructure/repository/product-repository/product.repository.js';

@Module({
  controllers: [GetWatchlistController],
  providers: [
    GetWatchlistHandler,
    WatchlistRepository,
    ProductRepository,
  ],
  exports: [GetWatchlistHandler],
})
export class GetWatchlistModule {}
