import { Module } from '@nestjs/common';
import { GetProductsModule } from './get-products/get-products.module.js';
import { GetProductByIdModule } from './get-product-by-id/get-product-by-id.module.js';
import { AddProductModule } from './add-product/add-product.module.js';

@Module({
  imports: [
    GetProductsModule,
    GetProductByIdModule,
    AddProductModule,
  ],
  exports: [
    GetProductsModule,
    GetProductByIdModule,
    AddProductModule,
  ],
})
export class ProductModule {}
