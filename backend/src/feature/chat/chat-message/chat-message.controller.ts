import { Controller, Post, Body } from '@nestjs/common';
import { ChatMessageHandler } from './chat-message.handler.js';
import { ChatMessageDto } from './chat-message.dto.js';
import { PublicAuthenticate } from '../../../infrastructure/decorator/public-authenticate/public-authenticate.decorator.js';
import { CurrentUser } from '../../../infrastructure/decorator/current-user/current-user.decorator.js';
import { UserEntity } from '../../../domain/user/user.entity.js';

@Controller('/chat')
export class ChatMessageController {
  constructor(private readonly chatMessageHandler: ChatMessageHandler) {}

  @PublicAuthenticate()
  @Post()
  async handleChatMessage(
    @Body() body: ChatMessageDto,
    @CurrentUser() user?: UserEntity,
  ) {
    const activeUserId = user?.uuid || body.userId || 'default-user';
    const data = await this.chatMessageHandler.handle(body, activeUserId);
    return {
      message: 'Chat processed successfully',
      data,
    };
  }
}
