import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ProductRepository } from '../../repository/product-repository/product.repository.js';
import { StockHistoryRepository } from '../../repository/stock-history-repository/stock-history.repository.js';
import { AlertRepository } from '../../repository/alert-repository/alert.repository.js';
import { ScraperService } from '../../service/scraper/scraper.service.js';
import { LLMService } from '../../service/llm/llm.service.js';
import { TelegramService } from '../../service/telegram/telegram.service.js';
import { SocketService } from '../../service/socket/socket.service.js';
import { StockStatusEnum } from '../../../domain/product/enum/stock-status.enum.js';
import { ProductEntity } from '../../../domain/product/product.entity.js';

@Injectable()
export class MonitoringService {
  private readonly logger = new Logger(MonitoringService.name);
  private isRunning = false;
  private lastRunAt?: Date;

  constructor(
    private readonly configService: ConfigService,
    private readonly productRepository: ProductRepository,
    private readonly stockHistoryRepository: StockHistoryRepository,
    private readonly alertRepository: AlertRepository,
    private readonly scraperService: ScraperService,
    private readonly llmService: LLMService,
    private readonly telegramService: TelegramService,
    private readonly socketService: SocketService,
  ) { }

  /**
   * Run full monitoring cycle over tracked products
   */
  async runMonitoringCycle(): Promise<{
    checkedCount: number;
    changedCount: number;
    alertsCount: number;
    details: any[];
  }> {
    if (this.isRunning) {
      this.logger.warn('Monitoring cycle is already running, skipping overlapping invocation.');
      return { checkedCount: 0, changedCount: 0, alertsCount: 0, details: [] };
    }

    this.isRunning = true;
    this.lastRunAt = new Date();
    this.logger.log('Starting monitoring cycle...');

    const products = await this.productRepository.find();
    let changedCount = 0;
    let alertsCount = 0;
    const details: any[] = [];

    for (const product of products) {
      try {
        const scraped = await this.scraperService.scrapeUrl(product.url);
        if (scraped.stockStatus === StockStatusEnum.UNKNOWN && !scraped.title) {
          // Skip if page was unreachable
          continue;
        }

        const classified = await this.llmService.classifyProductPage(
          scraped.rawTextSnippet || '',
          scraped,
        );

        const oldStatus = product.stockStatus;
        const newStatus = classified.stockStatus;
        const oldPrice = Number(product.currentPrice);
        const newPrice = classified.price !== undefined ? Number(classified.price) : oldPrice;

        const statusChanged = oldStatus !== newStatus;
        const priceChanged = Math.abs(oldPrice - newPrice) > 1;

        if (statusChanged || priceChanged) {
          changedCount++;

          const reason = statusChanged
            ? `Status changed from ${oldStatus} to ${newStatus}`
            : `Price changed from ₹${oldPrice} to ₹${newPrice}`;

          // Record history
          await this.stockHistoryRepository.save({
            productUuid: product.uuid,
            oldStatus,
            newStatus,
            oldPrice,
            newPrice,
            changeReason: reason,
          });

          // Check if favorable transition for alerting (e.g. back in stock or pre-order opened)
          const isFavorable =
            (oldStatus === StockStatusEnum.OUT_OF_STOCK && newStatus === StockStatusEnum.IN_STOCK) ||
            newStatus === StockStatusEnum.PRE_ORDER ||
            (priceChanged && newPrice < oldPrice);

          if (isFavorable) {
            alertsCount++;

            // Send Telegram alert
            await this.telegramService.broadcastAlert(
              product,
              oldStatus,
              newStatus,
              oldPrice,
              newPrice,
            );

            // Record alert in DB
            await this.alertRepository.save({
              productUuid: product.uuid,
              channel: 'TELEGRAM',
              recipient: 'Subscribers',
              oldStatus,
              newStatus,
              oldPrice,
              newPrice,
              message: reason,
              status: 'SENT',
            });

            // Emit real-time WebSocket alert to web clients
            if (this.socketService.server) {
              this.socketService.server.emit('stock_alert', {
                productUuid: product.uuid,
                title: product.title,
                url: product.url,
                retailer: product.retailer,
                oldStatus,
                newStatus,
                oldPrice,
                newPrice,
                reason,
                timestamp: new Date(),
              });
            }
          }

          // Update product record
          await this.productRepository.updateStockAndPrice(
            product.uuid,
            newStatus,
            newPrice,
            classified.specs,
          );

          details.push({
            uuid: product.uuid,
            title: product.title,
            retailer: product.retailer,
            oldStatus,
            newStatus,
            oldPrice,
            newPrice,
            alertFired: isFavorable,
          });
        }
      } catch (err: any) {
        this.logger.error(`Error monitoring product ${product.uuid} (${product.url}): ${err.message}`);
      }
    }

    this.isRunning = false;
    this.logger.log(
      `Monitoring cycle completed. Checked: ${products.length}, Changed: ${changedCount}, Alerts: ${alertsCount}`,
    );

    if (this.socketService.server) {
      this.socketService.server.emit('monitoring_completed', {
        checkedCount: products.length,
        changedCount,
        alertsCount,
        timestamp: this.lastRunAt,
      });
    }

    return {
      checkedCount: products.length,
      changedCount,
      alertsCount,
      details,
    };
  }

  /**
   * Simulation method for evaluation / live video demo
   */
  async simulateStatusChange(
    productUuid: string,
    targetStatus: StockStatusEnum = StockStatusEnum.IN_STOCK,
    targetPrice?: number,
  ): Promise<any> {
    const product = await this.productRepository.findByUuid(productUuid);
    if (!product) {
      throw new Error(`Product not found: ${productUuid}`);
    }

    const oldStatus = product.stockStatus;
    const oldPrice = Number(product.currentPrice);
    const newPrice = targetPrice !== undefined ? targetPrice : oldPrice;

    // Update product
    await this.productRepository.updateStockAndPrice(
      product.uuid,
      targetStatus,
      newPrice,
    );

    const reason = `[SIMULATED DEMO] Status transitioned from ${oldStatus} to ${targetStatus}`;

    // Record stock history
    await this.stockHistoryRepository.save({
      productUuid: product.uuid,
      oldStatus,
      newStatus: targetStatus,
      oldPrice,
      newPrice,
      changeReason: reason,
    });

    // Send Telegram alert
    await this.telegramService.broadcastAlert(
      product,
      oldStatus,
      targetStatus,
      oldPrice,
      newPrice,
    );

    // Save alert in database
    await this.alertRepository.save({
      productUuid: product.uuid,
      channel: 'TELEGRAM',
      recipient: 'Subscribers',
      oldStatus,
      newStatus: targetStatus,
      oldPrice,
      newPrice,
      message: reason,
      status: 'SENT',
    });

    // Emit live WebSocket event
    if (this.socketService.server) {
      this.socketService.server.emit('stock_alert', {
        productUuid: product.uuid,
        title: product.title,
        url: product.url,
        retailer: product.retailer,
        oldStatus,
        newStatus: targetStatus,
        oldPrice,
        newPrice,
        reason,
        timestamp: new Date(),
        isSimulated: true,
      });
    }

    return {
      success: true,
      product: {
        uuid: product.uuid,
        title: product.title,
        oldStatus,
        newStatus: targetStatus,
        oldPrice,
        newPrice,
      },
      message: 'Simulated alert fired successfully to Telegram and Web clients!',
    };
  }

  getStatus() {
    return {
      isRunning: this.isRunning,
      lastRunAt: this.lastRunAt,
    };
  }
}
