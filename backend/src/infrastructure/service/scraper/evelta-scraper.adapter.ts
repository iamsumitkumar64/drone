import { BaseRetailerAdapter } from './base-scraper.adapter.js';
import { RetailerEnum } from '../../../domain/product/enum/retailer.enum.js';

export class EveltaScraperAdapter extends BaseRetailerAdapter {
  readonly retailerName = RetailerEnum.EVELTA;
  readonly domainPattern = 'evelta.com';
  readonly titleSuffixRegex = /\s*-\s*Evelta.*/i;
}
