import { StockStatusEnum } from '../../../domain/product/enum/stock-status.enum.js';

export class ScraperUtils {
  static cleanPrice(rawText: string | number | undefined | null): number {
    if (typeof rawText === 'number') return rawText;
    if (!rawText) return 0;
    const cleaned = String(rawText)
      .replace(/₹|,|\$|Rs\.?|INR|\s/gi, '')
      .trim();
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  }

  static stripHtml(rawHtml: string): string {
    return rawHtml
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  static parseJsonLd(html: string): any[] {
    const results: any[] = [];
    const regex = /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(html)) !== null) {
      try {
        const text = match[1].trim();
        if (text) {
          const json = JSON.parse(text);
          if (Array.isArray(json)) {
            results.push(...json);
          } else if (json['@graph'] && Array.isArray(json['@graph'])) {
            results.push(...json['@graph']);
          } else {
            results.push(json);
          }
        }
      } catch {
        // ignore JSON-LD parse errors
      }
    }
    return results;
  }

  static findProductInJsonLd(items: any[]): any | null {
    for (const item of items) {
      if (
        item['@type'] === 'Product' ||
        (Array.isArray(item['@type']) && item['@type'].includes('Product'))
      ) {
        return item;
      }
    }
    return null;
  }

  static determineAvailabilityFromSchema(availabilityUrl?: string): StockStatusEnum {
    if (!availabilityUrl) return StockStatusEnum.UNKNOWN;
    const lower = availabilityUrl.toLowerCase();
    if (lower.includes('instock')) return StockStatusEnum.IN_STOCK;
    if (lower.includes('outofstock') || lower.includes('soldout')) {
      return StockStatusEnum.OUT_OF_STOCK;
    }
    if (lower.includes('preorder') || lower.includes('backorder')) {
      return StockStatusEnum.PRE_ORDER;
    }
    return StockStatusEnum.UNKNOWN;
  }

  static extractMetaProperty(html: string, property: string): string | undefined {
    const pattern1 = new RegExp(
      `<meta\\s+[^>]*(?:property|name)=["']${property}["'][^>]*content=["']([^"']*)["']`,
      'i',
    );
    const pattern2 = new RegExp(
      `<meta\\s+[^>]*content=["']([^"']*)["'][^>]*(?:property|name)=["']${property}["']`,
      'i',
    );
    const match = html.match(pattern1) || html.match(pattern2);
    return match ? match[1] : undefined;
  }

  static extractTagText(html: string, tagName: string): string | undefined {
    const regex = new RegExp(`<${tagName}\\b[^>]*>([\\s\\S]*?)<\\/${tagName}>`, 'i');
    const match = html.match(regex);
    return match ? this.stripHtml(match[1]) : undefined;
  }

  static extractSpecsFromText(text: string): Record<string, string> {
    const specs: Record<string, string> = {};
    const ram = text.match(/\b([1248]GB)\b/i);
    if (ram) specs['RAM'] = ram[1].toUpperCase();

    const mcu = text.match(/\b(STM32[A-Z0-9]+|H743|F405|F722|RP2040)\b/i);
    if (mcu) specs['MCU'] = mcu[1].toUpperCase();

    const imu = text.match(/\b(ICM-?[0-9]+[A-Z]?|BMI[0-9]+|MPU[0-9]+)\b/i);
    if (imu) specs['IMU'] = imu[1].toUpperCase();

    const inputVolt = text.match(/\b([2-8]S(?:\s*LiPo)?|[0-9]+(?:\.[0-9]+)?V)\b/i);
    if (inputVolt) specs['Input Voltage'] = inputVolt[1];

    const current = text.match(/\b([0-9]+A)\b/i);
    if (current) specs['Current'] = current[1];

    return specs;
  }
}
