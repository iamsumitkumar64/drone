import { Injectable } from '@nestjs/common';
import { AlertRepository } from '../../../infrastructure/repository/alert-repository/alert.repository.js';

@Injectable()
export class GetAlertsHandler {
  constructor(private readonly alertRepository: AlertRepository) {}

  async handle(page: number = 1, limit: number = 10) {
    const { data, total, page: currentPage, limit: currentLimit } =
      await this.alertRepository.getRecentAlerts(page, limit);
    return {
      count: data.length,
      total,
      page: currentPage,
      limit: currentLimit,
      totalPages: Math.ceil(total / currentLimit),
      data,
    };
  }
}
