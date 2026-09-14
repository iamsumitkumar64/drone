import { IsOptional, IsString, IsEnum, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { RetailerEnum } from '../../../domain/product/enum/retailer.enum.js';
import { StockStatusEnum } from '../../../domain/product/enum/stock-status.enum.js';
import { ProductCategoryEnum } from '../../../domain/product/enum/product-category.enum.js';

export class GetProductsDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(RetailerEnum)
  retailer?: RetailerEnum;

  @IsOptional()
  @IsEnum(ProductCategoryEnum)
  category?: ProductCategoryEnum;

  @IsOptional()
  @IsEnum(StockStatusEnum)
  stockStatus?: StockStatusEnum;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  minPrice?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  maxPrice?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number = 12;
}
