import { StockStatusEnum } from '../../../domain/product/enum/stock-status.enum.js';
import { RetailerEnum } from '../../../domain/product/enum/retailer.enum.js';

export interface ScrapedProductData {
  title?: string;
  price?: number;
  currency?: string;
  stockStatus: StockStatusEnum;
  specs?: Record<string, any>;
  description?: string;
  imageUrl?: string;
  rawTextSnippet?: string;
  retailer?: RetailerEnum;
}

export interface RetailerScraperAdapter {
  readonly retailerName: RetailerEnum | string;
  canHandle(url: string): boolean;
  extract(html: string, url: string): Promise<ScrapedProductData>;
}
