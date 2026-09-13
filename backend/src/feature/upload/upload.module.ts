import { Module } from '@nestjs/common';
import { CreateSignedUrlModule } from './create-signed-url/create-signed-url.module.js';

@Module({
    imports: [
        CreateSignedUrlModule,
    ],
})
export class UploadModule { }
