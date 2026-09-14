import { Controller, Post } from '@nestjs/common';
import { RunMonitoringHandler } from './run-monitoring.handler.js';
import { PublicAuthenticate } from '../../../infrastructure/decorator/public-authenticate/public-authenticate.decorator.js';

@Controller('/monitoring')
export class RunMonitoringController {
  constructor(private readonly runMonitoringHandler: RunMonitoringHandler) {}

  @PublicAuthenticate()
  @Post('run')
  async runMonitoring() {
    const result = await this.runMonitoringHandler.handle();
    return {
      message: 'Monitoring cycle executed successfully',
      result,
    };
  }
}
