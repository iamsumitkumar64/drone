import { IsOptional, IsString } from 'class-validator';
import { NormalizeWhitespace } from '../../../infrastructure/transform/normalize-whitespace/normalize-whitespace.js';

export class CreateSignedUrlDto {
  @IsOptional()
  @IsString()
  @NormalizeWhitespace()
  folder?: string;
}
