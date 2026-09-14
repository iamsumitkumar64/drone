import { Module } from '@nestjs/common';
import { ChatMessageController } from './chat-message.controller.js';
import { ChatMessageHandler } from './chat-message.handler.js';
import { LLMService } from '../../../infrastructure/service/llm/llm.service.js';
import { ProductRepository } from '../../../infrastructure/repository/product-repository/product.repository.js';
import { WatchlistRepository } from '../../../infrastructure/repository/watchlist-repository/watchlist.repository.js';
import { ScraperService } from '../../../infrastructure/service/scraper/scraper.service.js';

@Module({
  controllers: [ChatMessageController],
  providers: [
    ChatMessageHandler,
    LLMService,
    ProductRepository,
    WatchlistRepository,
    ScraperService,
  ],
  exports: [ChatMessageHandler],
})
export class ChatMessageModule {}
