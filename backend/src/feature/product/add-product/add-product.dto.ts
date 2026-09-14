import { IsNotEmpty, IsUrl, IsOptional, IsEnum } from 'class-validator';
import { ProductCategoryEnum } from '../../../domain/product/enum/product-category.enum.js';

export class AddProductDto {
  @IsNotEmpty()
  @IsUrl()
  url: string;

  @IsOptional()
  @IsEnum(ProductCategoryEnum)
  category?: ProductCategoryEnum;
}
