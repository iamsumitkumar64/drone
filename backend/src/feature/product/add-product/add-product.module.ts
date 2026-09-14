import { Module } from '@nestjs/common';
import { AddProductController } from './add-product.controller.js';
import { AddProductHandler } from './add-product.handler.js';
import { ProductRepository } from '../../../infrastructure/repository/product-repository/product.repository.js';
import { ScraperService } from '../../../infrastructure/service/scraper/scraper.service.js';
import { LLMService } from '../../../infrastructure/service/llm/llm.service.js';

@Module({
  controllers: [AddProductController],
  providers: [
    AddProductHandler,
    ProductRepository,
    ScraperService,
    LLMService,
  ],
  exports: [AddProductHandler],
})
export class AddProductModule {}
