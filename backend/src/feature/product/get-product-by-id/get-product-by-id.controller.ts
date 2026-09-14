import { Controller, Get, Param } from '@nestjs/common';
import { GetProductByIdHandler } from './get-product-by-id.handler.js';
import { PublicAuthenticate } from '../../../infrastructure/decorator/public-authenticate/public-authenticate.decorator.js';

@Controller('/product')
export class GetProductByIdController {
  constructor(private readonly getProductByIdHandler: GetProductByIdHandler) {}

  @PublicAuthenticate()
  @Get(':uuid')
  async getProductById(@Param('uuid') uuid: string) {
    const data = await this.getProductByIdHandler.handle(uuid);
    return {
      message: 'Product retrieved successfully',
      data,
    };
  }
}
