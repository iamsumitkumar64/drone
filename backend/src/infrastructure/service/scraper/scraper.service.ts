import { Injectable, Logger } from '@nestjs/common';
import { RetailerScraperAdapter, ScrapedProductData } from './retailer-adapter.interface.js';
import { RobuScraperAdapter } from './robu-scraper.adapter.js';
import { ThinkRoboticsScraperAdapter } from './thinkrobotics-scraper.adapter.js';
import { ZboticScraperAdapter } from './zbotic-scraper.adapter.js';
import { EveltaScraperAdapter } from './evelta-scraper.adapter.js';
import { GenericScraperAdapter } from './generic-scraper.adapter.js';
import { RetailerEnum } from '../../../domain/product/enum/retailer.enum.js';
import { StockStatusEnum } from '../../../domain/product/enum/stock-status.enum.js';

@Injectable()
export class ScraperService {
  private readonly logger = new Logger(ScraperService.name);
  private adapters: RetailerScraperAdapter[] = [];
  private genericAdapter = new GenericScraperAdapter();

  constructor() {
    // Register default seed retailer adapters
    this.registerAdapter(new RobuScraperAdapter());
    this.registerAdapter(new ThinkRoboticsScraperAdapter());
    this.registerAdapter(new ZboticScraperAdapter());
    this.registerAdapter(new EveltaScraperAdapter());
  }

  registerAdapter(adapter: RetailerScraperAdapter) {
    this.adapters.push(adapter);
    this.logger.log(`Registered retailer scraper adapter: ${adapter.retailerName}`);
  }

  detectRetailer(url: string): RetailerEnum {
    const lower = url.toLowerCase();
    if (lower.includes('robu.in')) return RetailerEnum.ROBU;
    if (lower.includes('thinkrobotics.com')) return RetailerEnum.THINKROBOTICS;
    if (lower.includes('zbotic.in')) return RetailerEnum.ZBOTIC;
    if (lower.includes('evelta.com')) return RetailerEnum.EVELTA;
    return RetailerEnum.OTHER;
  }

  private findAdapter(url: string): RetailerScraperAdapter {
    for (const adapter of this.adapters) {
      if (adapter.canHandle(url)) {
        return adapter;
      }
    }
    return this.genericAdapter;
  }

  async scrapeUrl(url: string): Promise<ScrapedProductData> {
    this.logger.log(`Scraping product page: ${url}`);
    const adapter = this.findAdapter(url);

    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          Accept:
            'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Cache-Control': 'no-cache',
        },
        signal: AbortSignal.timeout(15000), // 15 sec timeout
      });

      if (!response.ok) {
        this.logger.warn(`Failed to fetch ${url}, status: ${response.status}`);
        return {
          stockStatus: StockStatusEnum.UNKNOWN,
          retailer: this.detectRetailer(url),
        };
      }

      const html = await response.text();
      const extracted = await adapter.extract(html, url);
      extracted.retailer = this.detectRetailer(url);
      return extracted;
    } catch (error: any) {
      this.logger.error(`Error scraping URL ${url}: ${error.message}`);
      return {
        stockStatus: StockStatusEnum.UNKNOWN,
        retailer: this.detectRetailer(url),
      };
    }
  }
}
