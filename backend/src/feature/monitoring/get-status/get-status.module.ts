import { Module } from '@nestjs/common';
import { GetStatusController } from './get-status.controller.js';
import { GetStatusHandler } from './get-status.handler.js';
import { MonitoringService } from '../../../infrastructure/cron/monitoring/monitoring.service.js';

@Module({
  controllers: [GetStatusController],
  providers: [GetStatusHandler, MonitoringService],
  exports: [GetStatusHandler],
})
export class GetStatusModule { }
