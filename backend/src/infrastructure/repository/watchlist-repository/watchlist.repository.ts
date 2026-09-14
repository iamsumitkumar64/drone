import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { WatchlistEntity } from '../../../domain/watchlist/watchlist.entity.js';

@Injectable()
export class WatchlistRepository extends Repository<WatchlistEntity> {
  constructor(private readonly dataSource: DataSource) {
    super(WatchlistEntity, dataSource.createEntityManager());
  }

  async findByUser(userId: string): Promise<WatchlistEntity[]> {
    return await this.find({
      where: { userId },
      order: { created_at: 'DESC' },
    });
  }

  async findByUserPaginated(
    userId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ data: WatchlistEntity[]; total: number; page: number; limit: number }> {
    const validPage = Math.max(1, page || 1);
    const validLimit = Math.max(1, limit || 10);
    const skip = (validPage - 1) * validLimit;

    const [data, total] = await this.findAndCount({
      where: { userId },
      order: { created_at: 'DESC' },
      skip,
      take: validLimit,
    });
    return { data, total, page: validPage, limit: validLimit };
  }

  async findByProduct(productUuid: string): Promise<WatchlistEntity[]> {
    return await this.find({
      where: { productUuid },
    });
  }

  async findByUserAndProduct(
    userId: string,
    productUuid: string,
  ): Promise<WatchlistEntity | null> {
    return await this.findOne({
      where: { userId, productUuid },
    });
  }

  async removeByProductAndUser(userId: string, productUuid: string): Promise<boolean> {
    const result = await this.delete({ userId, productUuid });
    return (result.affected ?? 0) > 0;
  }
}
