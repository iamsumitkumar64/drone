import { Controller, Post, Body } from '@nestjs/common';
import { SimulateStatusChangeHandler } from './simulate-status-change.handler.js';
import { SimulateStatusChangeDto } from './simulate-status-change.dto.js';
import { PublicAuthenticate } from '../../../infrastructure/decorator/public-authenticate/public-authenticate.decorator.js';

@Controller('/monitoring')
export class SimulateStatusChangeController {
  constructor(private readonly simulateStatusChangeHandler: SimulateStatusChangeHandler) {}

  @PublicAuthenticate()
  @Post('simulate')
  async simulateStatusChange(@Body() body: SimulateStatusChangeDto) {
    return await this.simulateStatusChangeHandler.handle(body);
  }
}
