import { BaseRetailerAdapter } from './base-scraper.adapter.js';
import { RetailerEnum } from '../../../domain/product/enum/retailer.enum.js';

export class ZboticScraperAdapter extends BaseRetailerAdapter {
  readonly retailerName = RetailerEnum.ZBOTIC;
  readonly domainPattern = 'zbotic.in';
  readonly titleSuffixRegex = /\s*-\s*Zbotic.*/i;
}
