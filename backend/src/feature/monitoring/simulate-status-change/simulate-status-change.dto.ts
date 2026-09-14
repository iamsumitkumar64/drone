import { IsNotEmpty, IsUUID, IsOptional, IsEnum, IsNumber } from 'class-validator';
import { StockStatusEnum } from '../../../domain/product/enum/stock-status.enum.js';

export class SimulateStatusChangeDto {
  @IsNotEmpty()
  @IsUUID()
  productUuid: string;

  @IsOptional()
  @IsEnum(StockStatusEnum)
  targetStatus?: StockStatusEnum;

  @IsOptional()
  @IsNumber()
  targetPrice?: number;
}
