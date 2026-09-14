import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { MonitoringService } from './monitoring.service.js';

@Injectable()
export class MonitoringCron {
  private readonly logger = new Logger(MonitoringCron.name);

  constructor(private readonly monitoringService: MonitoringService) { }

  @Cron(process.env.MONITORING_CRON || CronExpression.EVERY_DAY_AT_MIDNIGHT, {
    name: 'product-stock-monitoring-cron',
  })
  async handleMonitoringCron() {
    this.logger.log('Executing scheduled product stock monitoring cron job...');
    try {
      const result = await this.monitoringService.runMonitoringCycle();
      this.logger.log(
        `Scheduled monitoring cron completed: ${result.checkedCount} checked, ${result.changedCount} changed, ${result.alertsCount} alerts sent.`,
      );
    } catch (error: any) {
      this.logger.error(`Scheduled monitoring cron job failed: ${error.message}`);
    }
  }
}
