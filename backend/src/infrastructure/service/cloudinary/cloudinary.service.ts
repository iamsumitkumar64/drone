import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class CloudinaryService {
    constructor(private readonly configService: ConfigService) {
        cloudinary.config({
            cloud_name: this.configService.get<string>('CLOUDINARY_CLOUD_NAME'),
            api_key: this.configService.get<string>('CLOUDINARY_API_KEY'),
            api_secret: this.configService.get<string>('CLOUDINARY_API_SECRET'),
        });
    }

    createUploadSignature(folder: string = 'setup') {
        const timestamp = Math.floor(Date.now() / 1000);
        const cloudName = this.configService.get<string>('CLOUDINARY_CLOUD_NAME');
        const apiKey = this.configService.get<string>('CLOUDINARY_API_KEY');
        const apiSecret = this.configService.get<string>('CLOUDINARY_API_SECRET') ?? '';

        const paramsToSign = {
            timestamp,
            folder,
        };

        const signature = cloudinary.utils.api_sign_request(
            paramsToSign,
            apiSecret,
        );

        return {                            // auto means -> any file here
            uploadUrl: `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
            signature,
            timestamp,
            apiKey,
            api_key: apiKey,
            // cloudName,
            folder,
        };
    }
}
