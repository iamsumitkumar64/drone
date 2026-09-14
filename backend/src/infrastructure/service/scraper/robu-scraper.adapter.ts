import { BaseRetailerAdapter } from './base-scraper.adapter.js';
import { RetailerEnum } from '../../../domain/product/enum/retailer.enum.js';

export class RobuScraperAdapter extends BaseRetailerAdapter {
  readonly retailerName = RetailerEnum.ROBU;
  readonly domainPattern = 'robu.in';
  readonly titleSuffixRegex = /\s*-\s*Robu\.in.*/i;
}
