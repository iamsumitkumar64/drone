import { RetailerScraperAdapter, ScrapedProductData } from './retailer-adapter.interface.js';
import { RetailerEnum } from '../../../domain/product/enum/retailer.enum.js';
import { StockStatusEnum } from '../../../domain/product/enum/stock-status.enum.js';
import { ScraperUtils } from './scraper.utils.js';

export abstract class BaseRetailerAdapter implements RetailerScraperAdapter {
  abstract readonly retailerName: RetailerEnum;
  abstract readonly domainPattern: string;
  readonly titleSuffixRegex?: RegExp;

  canHandle(url: string): boolean {
    return url.toLowerCase().includes(this.domainPattern);
  }

  async extract(html: string, url: string): Promise<ScrapedProductData> {
    const jsonLdItems = ScraperUtils.parseJsonLd(html);
    const productSchema = ScraperUtils.findProductInJsonLd(jsonLdItems);

    let title =
      productSchema?.name ||
      ScraperUtils.extractMetaProperty(html, 'og:title') ||
      ScraperUtils.extractTagText(html, 'h1') ||
      ScraperUtils.extractTagText(html, 'title') ||
      '';

    if (this.titleSuffixRegex) {
      title = title.replace(this.titleSuffixRegex, '').trim();
    }

    let price = 0;
    let stockStatus = StockStatusEnum.UNKNOWN;

    if (productSchema?.offers) {
      const offers = Array.isArray(productSchema.offers)
        ? productSchema.offers[0]
        : productSchema.offers;
      if (offers) {
        price = ScraperUtils.cleanPrice(offers.price);
        stockStatus = ScraperUtils.determineAvailabilityFromSchema(offers.availability);
      }
    }

    // HTML fallback for stock status
    if (stockStatus === StockStatusEnum.UNKNOWN) {
      if (
        /class=["'][^"']*out-of-stock[^"']*["']/i.test(html) ||
        /p class=["']stock out-of-stock["']/i.test(html) ||
        /sold out/i.test(html)
      ) {
        stockStatus = StockStatusEnum.OUT_OF_STOCK;
      } else if (
        /class=["'][^"']*in-stock[^"']*["']/i.test(html) ||
        /single_add_to_cart_button/i.test(html) ||
        /in stock/i.test(html)
      ) {
        stockStatus = StockStatusEnum.IN_STOCK;
      } else if (/pre-order|backorder/i.test(html)) {
        stockStatus = StockStatusEnum.PRE_ORDER;
      }
    }

    // HTML fallback for price
    if (!price || price === 0) {
      const priceMatch =
        html.match(/class=["'][^"']*(?:woocommerce-Price-amount|price)[^"']*["'][^>]*>([\s\S]*?)<\/span>/i) ||
        html.match(/(?:₹|Rs\.?|INR)\s*([\d,]+(?:\.\d+)?)/i);
      if (priceMatch) {
        price = ScraperUtils.cleanPrice(priceMatch[1]);
      }
    }

    const imageUrl =
      productSchema?.image?.url ||
      (typeof productSchema?.image === 'string' ? productSchema.image : undefined) ||
      ScraperUtils.extractMetaProperty(html, 'og:image');

    const description =
      productSchema?.description ||
      ScraperUtils.extractMetaProperty(html, 'og:description') ||
      ScraperUtils.extractMetaProperty(html, 'description');

    const specs = ScraperUtils.extractSpecsFromText(`${title} ${description || ''}`);

    return {
      title,
      price,
      currency: 'INR',
      stockStatus,
      specs,
      description,
      imageUrl,
      retailer: this.retailerName,
    };
  }
}
