import { Module, Global } from '@nestjs/common';
import { RunMonitoringModule } from './run-monitoring/run-monitoring.module.js';
import { SimulateStatusChangeModule } from './simulate-status-change/simulate-status-change.module.js';
import { GetAlertsModule } from './get-alerts/get-alerts.module.js';
import { GetHistoryModule } from './get-history/get-history.module.js';
import { GetStatusModule } from './get-status/get-status.module.js';
import { MonitoringService } from '../../infrastructure/cron/monitoring/monitoring.service.js';
import { TelegramService } from '../../infrastructure/service/telegram/telegram.service.js';
import { ScraperService } from '../../infrastructure/service/scraper/scraper.service.js';
import { LLMService } from '../../infrastructure/service/llm/llm.service.js';
import { ProductRepository } from '../../infrastructure/repository/product-repository/product.repository.js';
import { StockHistoryRepository } from '../../infrastructure/repository/stock-history-repository/stock-history.repository.js';
import { AlertRepository } from '../../infrastructure/repository/alert-repository/alert.repository.js';
import { WatchlistRepository } from '../../infrastructure/repository/watchlist-repository/watchlist.repository.js';
import { SocketModule } from '../../infrastructure/service/socket/socket.module.js';

@Global()
@Module({
  imports: [
    SocketModule,
    RunMonitoringModule,
    SimulateStatusChangeModule,
    GetAlertsModule,
    GetHistoryModule,
    GetStatusModule,
  ],
  providers: [
    MonitoringService,
    TelegramService,
    ScraperService,
    LLMService,
    ProductRepository,
    StockHistoryRepository,
    AlertRepository,
    WatchlistRepository,
  ],
  exports: [
    MonitoringService,
    TelegramService,
    ScraperService,
    LLMService,
    ProductRepository,
    StockHistoryRepository,
    AlertRepository,
    WatchlistRepository,
    RunMonitoringModule,
    SimulateStatusChangeModule,
    GetAlertsModule,
    GetHistoryModule,
    GetStatusModule,
  ],
})
export class MonitoringModule { }
