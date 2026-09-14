import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { AlertEntity } from '../../../domain/alert/alert.entity.js';

@Injectable()
export class AlertRepository extends Repository<AlertEntity> {
  constructor(private readonly dataSource: DataSource) {
    super(AlertEntity, dataSource.createEntityManager());
  }

  async getRecentAlerts(
    page: number = 1,
    limit: number = 10,
  ): Promise<{ data: AlertEntity[]; total: number; page: number; limit: number }> {
    const validPage = Math.max(1, page || 1);
    const validLimit = Math.max(1, limit || 10);
    const skip = (validPage - 1) * validLimit;

    const [data, total] = await this.findAndCount({
      order: { sentAt: 'DESC' },
      skip,
      take: validLimit,
    });
    return { data, total, page: validPage, limit: validLimit };
  }

  async getAlertsByProduct(productUuid: string): Promise<AlertEntity[]> {
    return await this.find({
      where: { productUuid },
      order: { sentAt: 'DESC' },
    });
  }
}
