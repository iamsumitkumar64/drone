import { Injectable } from '@nestjs/common';
import { GetProductsDto } from './get-products.dto.js';
import { ProductRepository } from '../../../infrastructure/repository/product-repository/product.repository.js';

@Injectable()
export class GetProductsHandler {
  constructor(private readonly productRepository: ProductRepository) {}

  async handle(query: GetProductsDto) {
    const { data, total, page, limit } = await this.productRepository.findAllFiltered(query);
    return {
      count: data.length,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      data,
    };
  }
}
