import { Module } from '@nestjs/common';
import { RunMonitoringController } from './run-monitoring.controller.js';
import { RunMonitoringHandler } from './run-monitoring.handler.js';
import { MonitoringService } from '../../../infrastructure/cron/monitoring/monitoring.service.js';

@Module({
  controllers: [RunMonitoringController],
  providers: [RunMonitoringHandler, MonitoringService],
  exports: [RunMonitoringHandler],
})
export class RunMonitoringModule { }
