import { Injectable } from '@nestjs/common';
import { DataSource, Repository, ILike, Between, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { ProductEntity } from '../../../domain/product/product.entity.js';
import { StockStatusEnum } from '../../../domain/product/enum/stock-status.enum.js';
import { ProductCategoryEnum } from '../../../domain/product/enum/product-category.enum.js';
import { RetailerEnum } from '../../../domain/product/enum/retailer.enum.js';

export interface ProductFilterQuery {
  search?: string;
  retailer?: RetailerEnum;
  category?: ProductCategoryEnum;
  stockStatus?: StockStatusEnum;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
}

@Injectable()
export class ProductRepository extends Repository<ProductEntity> {
  constructor(private readonly dataSource: DataSource) {
    super(ProductEntity, dataSource.createEntityManager());
  }

  async findByUrl(url: string): Promise<ProductEntity | null> {
    return await this.findOne({ where: { url } });
  }

  async findByUuid(uuid: string): Promise<ProductEntity | null> {
    return await this.findOne({ where: { uuid } });
  }

  async findAllFiltered(
    filter: ProductFilterQuery,
  ): Promise<{ data: ProductEntity[]; total: number; page: number; limit: number }> {
    const qb = this.createQueryBuilder('p');

    if (filter.search) {
      qb.andWhere('(p.title ILIKE :search OR p.description ILIKE :search)', {
        search: `%${filter.search}%`,
      });
    }

    if (filter.retailer) {
      qb.andWhere('p.retailer = :retailer', { retailer: filter.retailer });
    }

    if (filter.category) {
      qb.andWhere('p.category = :category', { category: filter.category });
    }

    if (filter.stockStatus) {
      qb.andWhere('p.stockStatus = :stockStatus', {
        stockStatus: filter.stockStatus,
      });
    }

    if (filter.minPrice !== undefined) {
      qb.andWhere('p.currentPrice >= :minPrice', { minPrice: filter.minPrice });
    }

    if (filter.maxPrice !== undefined) {
      qb.andWhere('p.currentPrice <= :maxPrice', { maxPrice: filter.maxPrice });
    }

    qb.orderBy('p.updated_at', 'DESC');

    const page = Math.max(1, filter.page || 1);
    const limit = Math.max(1, filter.limit || 12);
    const skip = (page - 1) * limit;

    qb.skip(skip).take(limit);

    const [data, total] = await qb.getManyAndCount();
    return { data, total, page, limit };
  }

  async updateStockAndPrice(
    uuid: string,
    stockStatus: StockStatusEnum,
    currentPrice: number,
    specs?: Record<string, any>,
  ): Promise<ProductEntity | null> {
    const updateData: Partial<ProductEntity> = {
      stockStatus,
      currentPrice,
      lastCheckedAt: new Date(),
    };
    if (specs && Object.keys(specs).length > 0) {
      updateData.specs = specs;
    }
    await this.update({ uuid }, updateData);
    return await this.findByUuid(uuid);
  }
}
