import { Injectable } from '@nestjs/common';
import { ChatMessageDto } from './chat-message.dto.js';
import { LLMService } from '../../../infrastructure/service/llm/llm.service.js';
import { ProductRepository } from '../../../infrastructure/repository/product-repository/product.repository.js';
import { WatchlistRepository } from '../../../infrastructure/repository/watchlist-repository/watchlist.repository.js';
import { ScraperService } from '../../../infrastructure/service/scraper/scraper.service.js';

@Injectable()
export class ChatMessageHandler {
  constructor(
    private readonly llmService: LLMService,
    private readonly productRepository: ProductRepository,
    private readonly watchlistRepository: WatchlistRepository,
    private readonly scraperService: ScraperService,
  ) {}

  async handle(body: ChatMessageDto, activeUserId: string) {
    const catalog = await this.productRepository.find();
    const watchlist = await this.watchlistRepository.findByUser(activeUserId);

    const chatResponse = await this.llmService.processChat(
      body.message,
      catalog,
      watchlist,
    );

    // If intent is ADD_WATCHLIST with URL, execute automatically
    if (
      chatResponse.intent === 'ADD_WATCHLIST' &&
      chatResponse.actionData?.targetUrl
    ) {
      const url = chatResponse.actionData.targetUrl;
      let product = await this.productRepository.findByUrl(url);

      if (!product) {
        const scraped = await this.scraperService.scrapeUrl(url);
        const classified = await this.llmService.classifyProductPage(
          scraped.rawTextSnippet || '',
          scraped,
        );

        product = await this.productRepository.save({
          title: classified.title || scraped.title || 'Tracked Drone Part',
          url,
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
          userId: activeUserId,
          productUuid: product.uuid,
          notifyTelegram: true,
          notifyWeb: true,
        });

        chatResponse.reply += `\n\n📌 **Tracking Confirmed:** [${product.title}](${product.url}) is now saved to your watchlist!`;
      }
    }

    return chatResponse;
  }
}
