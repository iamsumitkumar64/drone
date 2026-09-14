import { Controller, Get, Query } from '@nestjs/common';
import { GetProductsHandler } from './get-products.handler.js';
import { GetProductsDto } from './get-products.dto.js';
import { PublicAuthenticate } from '../../../infrastructure/decorator/public-authenticate/public-authenticate.decorator.js';

@Controller('/product')
export class GetProductsController {
  constructor(private readonly getProductsHandler: GetProductsHandler) {}

  @PublicAuthenticate()
  @Get()
  async getProducts(@Query() query: GetProductsDto) {
    const result = await this.getProductsHandler.handle(query);
    return {
      message: 'Products fetched successfully',
      ...result,
    };
  }
}
