import { Module } from '@nestjs/common';
import { GetProductsController } from './get-products.controller.js';
import { GetProductsHandler } from './get-products.handler.js';
import { ProductRepository } from '../../../infrastructure/repository/product-repository/product.repository.js';

@Module({
  controllers: [GetProductsController],
  providers: [GetProductsHandler, ProductRepository],
  exports: [GetProductsHandler],
})
export class GetProductsModule {}
