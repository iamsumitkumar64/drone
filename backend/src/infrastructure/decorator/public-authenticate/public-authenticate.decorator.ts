import { SetMetadata } from "@nestjs/common";

export const PUBLIC_AUTHENTICATE_KEY = 'public_authenticate'
export const PublicAuthenticate = () => SetMetadata(PUBLIC_AUTHENTICATE_KEY, true);
