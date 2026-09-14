import { Module } from '@nestjs/common';
import { SimulateStatusChangeController } from './simulate-status-change.controller.js';
import { SimulateStatusChangeHandler } from './simulate-status-change.handler.js';
import { MonitoringService } from '../../../infrastructure/cron/monitoring/monitoring.service.js';

@Module({
  controllers: [SimulateStatusChangeController],
  providers: [SimulateStatusChangeHandler, MonitoringService],
  exports: [SimulateStatusChangeHandler],
})
export class SimulateStatusChangeModule { }
