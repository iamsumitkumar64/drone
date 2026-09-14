import { Injectable, Logger, OnModuleInit, OnModuleDestroy, forwardRef, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ProductEntity } from '../../../domain/product/product.entity.js';
import { StockStatusEnum } from '../../../domain/product/enum/stock-status.enum.js';
import { ProductRepository } from '../../repository/product-repository/product.repository.js';
import { WatchlistRepository } from '../../repository/watchlist-repository/watchlist.repository.js';
import { LLMService } from '../llm/llm.service.js';
import { ScraperService } from '../scraper/scraper.service.js';

@Injectable()
export class TelegramService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(TelegramService.name);
  private botToken?: string;
  private defaultChatId?: string;
  private isPolling = false;
  private lastUpdateId = 0;
  private subscribedChatIds = new Set<string>();

  constructor(
    private readonly configService: ConfigService,
    private readonly productRepository: ProductRepository,
    private readonly watchlistRepository: WatchlistRepository,
    private readonly llmService: LLMService,
    private readonly scraperService: ScraperService,
  ) {
    this.botToken = this.configService.get<string>('TELEGRAM_BOT_TOKEN');
    this.defaultChatId = this.configService.get<string>('TELEGRAM_CHAT_ID');

    if (this.defaultChatId) {
      this.subscribedChatIds.add(this.defaultChatId);
    }
  }

  async onModuleInit() {
    if (this.botToken && this.botToken.trim() !== '') {
      this.logger.log('Telegram bot token configured. Starting long-polling...');
      this.isPolling = true;
      this.startPollingLoop();
    } else {
      this.logger.log('TELEGRAM_BOT_TOKEN not provided. Telegram bot is in standby mode.');
    }
  }

  onModuleDestroy() {
    this.isPolling = false;
  }

  private async startPollingLoop() {
    while (this.isPolling) {
      try {
        const updates = await this.getUpdates(this.lastUpdateId + 1);
        for (const update of updates) {
          this.lastUpdateId = update.update_id;
          if (update.message && update.message.text) {
            await this.handleIncomingMessage(update.message);
          }
        }
      } catch (err: any) {
        this.logger.error(`Telegram polling error: ${err.message}`);
        await new Promise((r) => setTimeout(r, 5000));
      }
    }
  }

  private async getUpdates(offset: number): Promise<any[]> {
    const url = `https://api.telegram.org/bot${this.botToken}/getUpdates?offset=${offset}&timeout=20`;
    const res = await fetch(url, { signal: AbortSignal.timeout(25000) });
    if (!res.ok) return [];
    const data = await res.json();
    return data?.result || [];
  }

  async sendMessage(chatId: string | number, text: string): Promise<boolean> {
    if (!this.botToken) {
      this.logger.debug(`[Mock Telegram Send] To ${chatId}: ${text}`);
      return false;
    }
    try {
      const url = `https://api.telegram.org/bot${this.botToken}/sendMessage`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text,
          parse_mode: 'Markdown',
          disable_web_page_preview: false,
        }),
      });
      return res.ok;
    } catch (err: any) {
      this.logger.error(`Failed to send Telegram message to ${chatId}: ${err.message}`);
      return false;
    }
  }

  private async handleIncomingMessage(msg: any) {
    const chatId = String(msg.chat.id);
    const text = msg.text.trim();
    this.subscribedChatIds.add(chatId);

    this.logger.log(`Received Telegram message from ${chatId}: ${text}`);

    if (text.startsWith('/start') || text.startsWith('/help')) {
      const welcome = `🚁 *AI Shopping Assistant for Drone Parts*\n\nWelcome! I monitor specialty drone retailers (Robu.in, ThinkRobotics, Zbotic, Evelta) for flight controllers, companion computers, and HATs.\n\n*Commands:*\n• /watchlist - View your tracked products\n• /watch <url> - Track a new retailer URL\n• /search <query> - Search products in catalog\n• Or just ask: _"Find Pixhawk 6X in stock"_ or _"Any flight controllers under ₹10,000?"_`;
      await this.sendMessage(chatId, welcome);
      return;
    }

    if (text.startsWith('/watchlist')) {
      const tracked = await this.watchlistRepository.findByUser(chatId);
      if (tracked.length === 0) {
        await this.sendMessage(chatId, `Your watchlist is currently empty. Send me a product URL or use /watch <url> to track parts!`);
        return;
      }
      const products = await Promise.all(
        tracked.map((t) => this.productRepository.findByUuid(t.productUuid)),
      );
      const list = products
        .filter(Boolean)
        .map(
          (p) =>
            `• *${p!.title}* (${p!.retailer})\n  Status: \`${p!.stockStatus}\` | Price: ₹${p!.currentPrice}\n  [Link](${p!.url})`,
        )
        .join('\n\n');
      await this.sendMessage(chatId, `📋 *Your Tracked Drone Parts:*\n\n${list}`);
      return;
    }

    if (text.startsWith('/watch')) {
      const urlMatch = text.match(/https?:\/\/[^\s]+/);
      if (!urlMatch) {
        await this.sendMessage(chatId, `Please provide a valid product URL. Example:\n/watch https://robu.in/product/...`);
        return;
      }
      const targetUrl = urlMatch[0];
      await this.sendMessage(chatId, `🔎 Scraping and tracking product from ${targetUrl}...`);

      let product = await this.productRepository.findByUrl(targetUrl);
      if (!product) {
        const scraped = await this.scraperService.scrapeUrl(targetUrl);
        const classified = await this.llmService.classifyProductPage(
          scraped.rawTextSnippet || '',
          scraped,
        );
        product = await this.productRepository.save({
          title: classified.title || scraped.title || 'Tracked Drone Part',
          url: targetUrl,
          retailer: scraped.retailer,
          category: (scraped as any).category || 'general',
          stockStatus: classified.stockStatus,
          currentPrice: classified.price || scraped.price || 0,
          specs: classified.specs || {},
          imageUrl: scraped.imageUrl,
          lastCheckedAt: new Date(),
        } as any);
      }

      if (product) {
        await this.watchlistRepository.save({
          userId: chatId,
          productUuid: product.uuid,
          notifyTelegram: true,
          notifyWeb: true,
        });

        await this.sendMessage(
          chatId,
          `✅ Added to your watchlist!\n*${product.title}*\nStatus: \`${product.stockStatus}\`\nPrice: ₹${product.currentPrice}`,
        );
      } else {
        await this.sendMessage(chatId, `⚠️ Could not parse product from the provided URL.`);
      }
      return;
    }

    // Conversational query via LLM
    const catalog = await this.productRepository.find();
    const watchlist = await this.watchlistRepository.findByUser(chatId);
    const result = await this.llmService.processChat(text, catalog, watchlist);

    await this.sendMessage(chatId, result.reply);
  }

  async broadcastAlert(
    product: ProductEntity,
    oldStatus: StockStatusEnum,
    newStatus: StockStatusEnum,
    oldPrice?: number,
    newPrice?: number,
  ): Promise<number> {
    const isFavorable =
      (oldStatus === StockStatusEnum.OUT_OF_STOCK && newStatus === StockStatusEnum.IN_STOCK) ||
      newStatus === StockStatusEnum.PRE_ORDER ||
      (oldPrice && newPrice && newPrice < oldPrice);

    const statusEmoji = newStatus === StockStatusEnum.IN_STOCK ? '🟢 IN STOCK' : newStatus === StockStatusEnum.PRE_ORDER ? '🟡 PRE-ORDER OPEN' : newStatus;

    const message = `🚨 *DRONE PART ALERT!*\n\n*Product:* [${product.title}](${product.url})\n*Retailer:* ${product.retailer}\n*Status Change:* \`${oldStatus}\` ➡️ *${statusEmoji}*\n*Price:* ₹${Number(product.currentPrice).toLocaleString()}${oldPrice && oldPrice !== newPrice ? ` _(was ₹${Number(oldPrice).toLocaleString()})_` : ''}\n\n👉 [Buy Now / View Product](${product.url})`;

    let deliveredCount = 0;

    // Send to default chat ID if configured
    if (this.defaultChatId) {
      const sent = await this.sendMessage(this.defaultChatId, message);
      if (sent) deliveredCount++;
    }

    // Send to all chats watching this product
    const watchers = await this.watchlistRepository.findByProduct(product.uuid);
    for (const w of watchers) {
      if (w.userId !== this.defaultChatId && w.notifyTelegram) {
        const sent = await this.sendMessage(w.userId, message);
        if (sent) deliveredCount++;
      }
    }

    return deliveredCount;
  }

  getSubscribedChats(): string[] {
    return Array.from(this.subscribedChatIds);
  }
}
