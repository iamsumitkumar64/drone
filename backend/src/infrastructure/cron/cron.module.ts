import { Module } from '@nestjs/common';
import { MonitoringModule } from '../../feature/monitoring/monitoring.module.js';
import { MonitoringCron } from './monitoring/monitoring.cron.js';

@Module({
  imports: [MonitoringModule],
  providers: [MonitoringCron],
  exports: [MonitoringCron],
})
export class CronModule {}
