import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { UserRepository } from '../../repository/user-repository/user-repository.js';
import { JwtHelperService } from '../../service/jwt/jwt.service.js';
import { Reflector } from '@nestjs/core';

@Injectable()
export class AuthenticateGuard implements CanActivate {
    constructor(
        private readonly jwtHelpService: JwtHelperService,
        private readonly userRepository: UserRepository,
        private readonly reflector: Reflector,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const PUBLIC_AUTHENTICATE_KEY = 'public_authenticate';

        // Check Public in metadata
        const isPublic = this.reflector.getAllAndOverride<boolean>(
            PUBLIC_AUTHENTICATE_KEY,
            [
                context.getHandler(),
                context.getClass(),
            ],
        );
        if (isPublic) {
            return true;
        }

        const req = context.switchToHttp().getRequest<Request>();

        // Get access_token
        const access_token = req.cookies?.access_token || req.headers.authorization;
        if (!access_token || Array.isArray(access_token)) {
            throw new UnauthorizedException('Unauthorized Access');
        }

        // Remove Bearer prefix
        const jwtToken = access_token.startsWith('Bearer ')
            ? access_token.substring(7) : access_token;

        // Verify JWT
        const user = await this.jwtHelpService.verifyJwtToken(jwtToken);
        if (!user) {
            throw new UnauthorizedException('Invalid token');
        }

        // Check user in DB
        const existingUser = await this.userRepository.findByUuid(user.uuid);
        if (!existingUser) {
            throw new UnauthorizedException('Account not found');
        }

        // Attach user to request
        req.user = existingUser;

        return true;
    }
}