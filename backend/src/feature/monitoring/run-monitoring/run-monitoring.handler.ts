import { Injectable } from '@nestjs/common';
import { MonitoringService } from '../../../infrastructure/cron/monitoring/monitoring.service.js';

@Injectable()
export class RunMonitoringHandler {
  constructor(private readonly monitoringService: MonitoringService) { }

  async handle() {
    return await this.monitoringService.runMonitoringCycle();
  }
}
