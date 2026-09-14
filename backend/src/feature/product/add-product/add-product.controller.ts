import { Controller, Post, Body } from '@nestjs/common';
import { AddProductHandler } from './add-product.handler.js';
import { AddProductDto } from './add-product.dto.js';
import { PublicAuthenticate } from '../../../infrastructure/decorator/public-authenticate/public-authenticate.decorator.js';

@Controller('/product')
export class AddProductController {
  constructor(private readonly addProductHandler: AddProductHandler) {}

  @PublicAuthenticate()
  @Post()
  async addProduct(@Body() body: AddProductDto) {
    const result = await this.addProductHandler.handle(body);
    return {
      message: result.isNew ? 'Product added successfully' : 'Product already exists',
      data: result.product,
    };
  }
}
