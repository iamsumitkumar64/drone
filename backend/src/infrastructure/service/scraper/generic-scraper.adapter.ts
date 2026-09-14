import { BaseRetailerAdapter } from './base-scraper.adapter.js';
import { RetailerEnum } from '../../../domain/product/enum/retailer.enum.js';

export class GenericScraperAdapter extends BaseRetailerAdapter {
  readonly retailerName = RetailerEnum.OTHER;
  readonly domainPattern = '';

  override canHandle(_url: string): boolean {
    return true;
  }
}
