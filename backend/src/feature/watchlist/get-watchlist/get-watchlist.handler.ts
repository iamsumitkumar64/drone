import { Injectable } from '@nestjs/common';
import { WatchlistRepository } from '../../../infrastructure/repository/watchlist-repository/watchlist.repository.js';
import { ProductRepository } from '../../../infrastructure/repository/product-repository/product.repository.js';

@Injectable()
export class GetWatchlistHandler {
  constructor(
    private readonly watchlistRepository: WatchlistRepository,
    private readonly productRepository: ProductRepository,
  ) {}

  async handle(userId: string, page: number = 1, limit: number = 10) {
    const { data: items, total, page: currentPage, limit: currentLimit } =
      await this.watchlistRepository.findByUserPaginated(userId, page, limit);

    const enriched = await Promise.all(
      items.map(async (item) => {
        const product = await this.productRepository.findByUuid(item.productUuid);
        return {
          ...item,
          product,
        };
      }),
    );

    return {
      count: enriched.length,
      total,
      page: currentPage,
      limit: currentLimit,
      totalPages: Math.ceil(total / currentLimit),
      data: enriched,
    };
  }
}
