import { BaseRetailerAdapter } from './base-scraper.adapter.js';
import { RetailerEnum } from '../../../domain/product/enum/retailer.enum.js';

export class ThinkRoboticsScraperAdapter extends BaseRetailerAdapter {
  readonly retailerName = RetailerEnum.THINKROBOTICS;
  readonly domainPattern = 'thinkrobotics.com';
  readonly titleSuffixRegex = /\s*-\s*ThinkRobotics.*/i;
}
