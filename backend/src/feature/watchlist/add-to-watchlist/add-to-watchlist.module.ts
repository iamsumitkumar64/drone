import { Module } from '@nestjs/common';
import { AddToWatchlistController } from './add-to-watchlist.controller.js';
import { AddToWatchlistHandler } from './add-to-watchlist.handler.js';
import { WatchlistRepository } from '../../../infrastructure/repository/watchlist-repository/watchlist.repository.js';
import { ProductRepository } from '../../../infrastructure/repository/product-repository/product.repository.js';

@Module({
  controllers: [AddToWatchlistController],
  providers: [
    AddToWatchlistHandler,
    WatchlistRepository,
    ProductRepository,
  ],
  exports: [AddToWatchlistHandler],
})
export class AddToWatchlistModule {}
