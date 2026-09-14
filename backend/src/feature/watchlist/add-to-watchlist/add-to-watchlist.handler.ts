import { Injectable, NotFoundException } from '@nestjs/common';
import { AddToWatchlistDto } from './add-to-watchlist.dto.js';
import { WatchlistRepository } from '../../../infrastructure/repository/watchlist-repository/watchlist.repository.js';
import { ProductRepository } from '../../../infrastructure/repository/product-repository/product.repository.js';

@Injectable()
export class AddToWatchlistHandler {
  constructor(
    private readonly watchlistRepository: WatchlistRepository,
    private readonly productRepository: ProductRepository,
  ) {}

  async handle(body: AddToWatchlistDto, activeUserId: string) {
    const product = await this.productRepository.findByUuid(body.productUuid);
    if (!product) {
      throw new NotFoundException(`Product ${body.productUuid} not found`);
    }

    let item = await this.watchlistRepository.findByUserAndProduct(
      activeUserId,
      body.productUuid,
    );

    if (item) {
      return {
        alreadyExists: true,
        item,
      };
    }

    item = await this.watchlistRepository.save({
      userId: activeUserId,
      productUuid: body.productUuid,
      targetPrice: body.targetPrice,
      notifyTelegram: body.notifyTelegram !== undefined ? body.notifyTelegram : true,
      notifyWeb: body.notifyWeb !== undefined ? body.notifyWeb : true,
    });

    return {
      alreadyExists: false,
      item,
    };
  }
}
