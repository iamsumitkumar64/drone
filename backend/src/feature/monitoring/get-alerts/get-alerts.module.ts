import { Module } from '@nestjs/common';
import { GetAlertsController } from './get-alerts.controller.js';
import { GetAlertsHandler } from './get-alerts.handler.js';
import { AlertRepository } from '../../../infrastructure/repository/alert-repository/alert.repository.js';

@Module({
  controllers: [GetAlertsController],
  providers: [GetAlertsHandler, AlertRepository],
  exports: [GetAlertsHandler],
})
export class GetAlertsModule {}
