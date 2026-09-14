import { Injectable } from '@nestjs/common';
import { SimulateStatusChangeDto } from './simulate-status-change.dto.js';
import { MonitoringService } from '../../../infrastructure/cron/monitoring/monitoring.service.js';
import { StockStatusEnum } from '../../../domain/product/enum/stock-status.enum.js';

@Injectable()
export class SimulateStatusChangeHandler {
  constructor(private readonly monitoringService: MonitoringService) { }

  async handle(body: SimulateStatusChangeDto) {
    return await this.monitoringService.simulateStatusChange(
      body.productUuid,
      body.targetStatus || StockStatusEnum.IN_STOCK,
      body.targetPrice,
    );
  }
}
