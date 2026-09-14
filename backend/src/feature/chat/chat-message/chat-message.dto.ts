import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class ChatMessageDto {
  @IsNotEmpty()
  @IsString()
  message: string;

  @IsOptional()
  @IsString()
  userId?: string;
}
