import { IsNotEmpty, IsUUID, IsOptional, IsNumber, IsBoolean, IsString } from 'class-validator';

export class AddToWatchlistDto {
  @IsNotEmpty()
  @IsUUID()
  productUuid: string;

  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsNumber()
  targetPrice?: number;

  @IsOptional()
  @IsBoolean()
  notifyTelegram?: boolean;

  @IsOptional()
  @IsBoolean()
  notifyWeb?: boolean;
}
