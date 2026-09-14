import { Injectable } from '@nestjs/common';
import { MonitoringService } from '../../../infrastructure/cron/monitoring/monitoring.service.js';

@Injectable()
export class GetStatusHandler {
  constructor(private readonly monitoringService: MonitoringService) { }

  async handle() {
    return this.monitoringService.getStatus();
  }
}
