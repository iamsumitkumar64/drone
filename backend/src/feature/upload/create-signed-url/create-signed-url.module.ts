import { Module } from '@nestjs/common';
import { CreateSignedUrlController } from './create-signed-url.controller.js';
import { CreateSignedUrlHandler } from './create-signed-url.handler.js';
import { CloudinaryService } from '../../../infrastructure/service/cloudinary/cloudinary.service.js';

@Module({
  imports: [],
  controllers: [CreateSignedUrlController],
  providers: [CreateSignedUrlHandler, CloudinaryService],
  exports: [],
})
export class CreateSignedUrlModule { }
