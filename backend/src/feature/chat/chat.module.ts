import { Module } from '@nestjs/common';
import { ChatMessageModule } from './chat-message/chat-message.module.js';

@Module({
  imports: [ChatMessageModule],
  exports: [ChatMessageModule],
})
export class ChatModule {}
