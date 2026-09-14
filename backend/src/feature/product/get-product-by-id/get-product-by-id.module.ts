import { Module } from '@nestjs/common';
import { GetProductByIdController } from './get-product-by-id.controller.js';
import { GetProductByIdHandler } from './get-product-by-id.handler.js';
import { ProductRepository } from '../../../infrastructure/repository/product-repository/product.repository.js';
import { StockHistoryRepository } from '../../../infrastructure/repository/stock-history-repository/stock-history.repository.js';

@Module({
  controllers: [GetProductByIdController],
  providers: [
    GetProductByIdHandler,
    ProductRepository,
    StockHistoryRepository,
  ],
  exports: [GetProductByIdHandler],
})
export class GetProductByIdModule {}
