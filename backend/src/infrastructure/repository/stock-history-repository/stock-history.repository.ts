import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { StockHistoryEntity } from '../../../domain/stock-history/stock-history.entity.js';

@Injectable()
export class StockHistoryRepository extends Repository<StockHistoryEntity> {
  constructor(private readonly dataSource: DataSource) {
    super(StockHistoryEntity, dataSource.createEntityManager());
  }

  async findByProductUuid(productUuid: string): Promise<StockHistoryEntity[]> {
    return await this.find({
      where: { productUuid },
      order: { created_at: 'DESC' },
    });
  }

  async getRecentHistory(
    page: number = 1,
    limit: number = 10,
  ): Promise<{ data: StockHistoryEntity[]; total: number; page: number; limit: number }> {
    const validPage = Math.max(1, page || 1);
    const validLimit = Math.max(1, limit || 10);
    const skip = (validPage - 1) * validLimit;

    const [data, total] = await this.findAndCount({
      order: { created_at: 'DESC' },
      skip,
      take: validLimit,
    });
    return { data, total, page: validPage, limit: validLimit };
  }
}
