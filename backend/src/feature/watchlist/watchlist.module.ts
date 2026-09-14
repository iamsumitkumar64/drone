import { Module } from '@nestjs/common';
import { GetWatchlistModule } from './get-watchlist/get-watchlist.module.js';
import { AddToWatchlistModule } from './add-to-watchlist/add-to-watchlist.module.js';
import { RemoveFromWatchlistModule } from './remove-from-watchlist/remove-from-watchlist.module.js';

@Module({
  imports: [
    GetWatchlistModule,
    AddToWatchlistModule,
    RemoveFromWatchlistModule,
  ],
  exports: [
    GetWatchlistModule,
    AddToWatchlistModule,
    RemoveFromWatchlistModule,
  ],
})
export class WatchlistModule {}
