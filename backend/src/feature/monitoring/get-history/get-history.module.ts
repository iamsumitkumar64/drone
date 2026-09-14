import { Module } from '@nestjs/common';
import { GetHistoryController } from './get-history.controller.js';
import { GetHistoryHandler } from './get-history.handler.js';
import { StockHistoryRepository } from '../../../infrastructure/repository/stock-history-repository/stock-history.repository.js';

@Module({
  controllers: [GetHistoryController],
  providers: [GetHistoryHandler, StockHistoryRepository],
  exports: [GetHistoryHandler],
})
export class GetHistoryModule {}
