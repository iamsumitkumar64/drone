import { describe, it, expect } from 'vitest';
import { ScraperService } from './scraper.service.js';
import { RetailerEnum } from '../../../domain/product/enum/retailer.enum.js';
import { StockStatusEnum } from '../../../domain/product/enum/stock-status.enum.js';
import { RobuScraperAdapter } from './robu-scraper.adapter.js';

describe('ScraperService & Adapters', () => {
  const scraperService = new ScraperService();

  it('should detect retailers correctly from URLs', () => {
    expect(scraperService.detectRetailer('https://robu.in/product/raspberry-pi-5/')).toBe(RetailerEnum.ROBU);
    expect(scraperService.detectRetailer('https://thinkrobotics.com/products/rpi-hat')).toBe(RetailerEnum.THINKROBOTICS);
    expect(scraperService.detectRetailer('https://zbotic.in/product/fc/')).toBe(RetailerEnum.ZBOTIC);
    expect(scraperService.detectRetailer('https://evelta.com/pixhawk/')).toBe(RetailerEnum.EVELTA);
    expect(scraperService.detectRetailer('https://amazon.in/drone/')).toBe(RetailerEnum.OTHER);
  });

  it('RobuScraperAdapter should extract title, price, and status from WooCommerce HTML', async () => {
    const adapter = new RobuScraperAdapter();
    const mockHtml = `
      <html>
        <head>
          <script type="application/ld+json">
            {
              "@type": "Product",
              "name": "Raspberry Pi 5 8GB",
              "offers": {
                "price": "7499.00",
                "availability": "http://schema.org/InStock"
              }
            }
          </script>
        </head>
        <body>
          <h1 class="product_title">Raspberry Pi 5 8GB - Robu.in</h1>
          <p class="stock in-stock">In stock</p>
          <p class="price"><span class="woocommerce-Price-amount">₹7,499.00</span></p>
        </body>
      </html>
    `;

    const data = await adapter.extract(mockHtml, 'https://robu.in/product/raspberry-pi-5-8gb/');
    expect(data.title).toContain('Raspberry Pi 5 8GB');
    expect(data.price).toBe(7499);
    expect(data.stockStatus).toBe(StockStatusEnum.IN_STOCK);
  });
});
