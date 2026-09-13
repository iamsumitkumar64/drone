import { Body, Controller, Post } from '@nestjs/common';
import { CreateSignedUrlHandler } from './create-signed-url.handler.js';
import { CreateSignedUrlDto } from './create-signed-url.dto.js';
import { PublicAuthenticate } from '../../../infrastructure/decorator/public-authenticate/public-authenticate.decorator.js';

@Controller('/upload/signed-url')
export class CreateSignedUrlController {
    constructor(
        private readonly createSignedUrlHandler: CreateSignedUrlHandler,
    ) { }

    @PublicAuthenticate()
    @Post()
    async createSignedUrlPost(@Body() body: CreateSignedUrlDto) {
        return await this.createSignedUrlHandler.handler(body);
    }
}
