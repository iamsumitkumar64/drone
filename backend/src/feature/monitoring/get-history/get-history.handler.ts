import { Injectable } from '@nestjs/common';
import { StockHistoryRepository } from '../../../infrastructure/repository/stock-history-repository/stock-history.repository.js';

@Injectable()
export class GetHistoryHandler {
  constructor(private readonly stockHistoryRepository: StockHistoryRepository) {}

  async handle(page: number = 1, limit: number = 10) {
    const { data, total, page: currentPage, limit: currentLimit } =
      await this.stockHistoryRepository.getRecentHistory(page, limit);
    return {
      count: data.length,
      total,
      page: currentPage,
      limit: currentLimit,
      totalPages: Math.ceil(total / currentLimit),
      data,
    };
  }
}
