import { Injectable, NotFoundException } from '@nestjs/common';
import { ProductRepository } from '../../../infrastructure/repository/product-repository/product.repository.js';
import { StockHistoryRepository } from '../../../infrastructure/repository/stock-history-repository/stock-history.repository.js';

@Injectable()
export class GetProductByIdHandler {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly stockHistoryRepository: StockHistoryRepository,
  ) {}

  async handle(uuid: string) {
    const product = await this.productRepository.findByUuid(uuid);
    if (!product) {
      throw new NotFoundException(`Product with ID ${uuid} not found`);
    }

    const history = await this.stockHistoryRepository.findByProductUuid(uuid);

    return {
      product,
      history,
    };
  }
}
