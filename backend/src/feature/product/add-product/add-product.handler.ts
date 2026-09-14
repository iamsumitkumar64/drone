import { Injectable } from '@nestjs/common';
import { AddProductDto } from './add-product.dto.js';
import { ProductRepository } from '../../../infrastructure/repository/product-repository/product.repository.js';
import { ScraperService } from '../../../infrastructure/service/scraper/scraper.service.js';
import { LLMService } from '../../../infrastructure/service/llm/llm.service.js';
import { ProductCategoryEnum } from '../../../domain/product/enum/product-category.enum.js';

@Injectable()
export class AddProductHandler {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly scraperService: ScraperService,
    private readonly llmService: LLMService,
  ) {}

  async handle(body: AddProductDto) {
    let existing = await this.productRepository.findByUrl(body.url);
    if (existing) {
      return {
        isNew: false,
        product: existing,
      };
    }

    const scraped = await this.scraperService.scrapeUrl(body.url);
    const classified = await this.llmService.classifyProductPage(
      scraped.rawTextSnippet || '',
      scraped,
    );

    const category = body.category || ProductCategoryEnum.GENERAL;

    const newProduct = await this.productRepository.save({
      title: classified.title || scraped.title || 'Drone Part',
      url: body.url,
      retailer: scraped.retailer,
      category,
      stockStatus: classified.stockStatus,
      currentPrice: classified.price || scraped.price || 0,
      currency: scraped.currency || 'INR',
      specs: classified.specs || scraped.specs || {},
      description: classified.summary || scraped.description,
      imageUrl: scraped.imageUrl,
      lastCheckedAt: new Date(),
    } as any);

    return {
      isNew: true,
      product: newProduct,
    };
  }
}
