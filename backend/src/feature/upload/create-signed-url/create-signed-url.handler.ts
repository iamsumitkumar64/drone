import { Injectable } from '@nestjs/common';
import { CreateSignedUrlDto } from './create-signed-url.dto.js';
import { ConfigService } from '@nestjs/config';
import { CloudinaryService } from '../../../infrastructure/service/cloudinary/cloudinary.service.js';

@Injectable()
export class CreateSignedUrlHandler {
    constructor(
        private readonly cloudinaryService: CloudinaryService,
        private readonly configService: ConfigService,
    ) { }

    async handler(dto: CreateSignedUrlDto) {
        const folder = dto?.folder || this.configService.get<string>('CLOUDINARY_FOLDER') || 'setup';
        const signatureData = this.cloudinaryService.createUploadSignature(folder);

        return {
            message: 'Signed URL generated successfully',
            ...signatureData,
        };
    }
}
