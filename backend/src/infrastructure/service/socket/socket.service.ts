import {
    OnGatewayConnection,
    OnGatewayDisconnect,
    WebSocketGateway,
    WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtHelperService } from '../jwt/jwt.service.js';
import { CookieService } from '../cookie/cookie.service.js';
import { UserRepository } from '../../repository/user-repository/user-repository.js';

const configService = new ConfigService();

@Injectable()
@WebSocketGateway({
    cors: {
        origin: configService.get<string>('FRONTEND_URL') || 'http://localhost:3000',
        credentials: true,
    },
})
export class SocketService implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    private activeUsers = new Map<string, string>();
    // user_uuid -> socket_id

    constructor(
        private readonly jwtHelperService: JwtHelperService,
        private readonly userRepository: UserRepository,
    ) { }

    async handleConnection(client: Socket) {
        try {
            const access_token = client.handshake.auth?.access_token ||
                CookieService.extractFromHeader(client.handshake.headers.cookie, 'access_token') ||
                client.handshake.headers.authorization;
            if (!access_token) {
                client.disconnect();
                return;
            }

            const decoded = await this.jwtHelperService.verifyJwtToken(access_token.startsWith('Bearer ') ? access_token.substring(7) : access_token);
            const user = await this.userRepository.findByUuid(decoded.uuid);

            if (!user) {
                client.disconnect();
                return;
            }

            this.activeUsers.set(decoded.uuid, client.id);
            console.log(`User connected: ${decoded.uuid}`);
        } catch (e) {
            client.disconnect();
        }
    }

    handleDisconnect(client: Socket) {
        for (const [uuid, socketId] of this.activeUsers.entries()) {
            if (socketId === client.id) {
                this.activeUsers.delete(uuid);
                console.log(`User disconnected: ${uuid}`);
                break;
            }
        }
    }

    // send msg to receiver only
    async emitToUser(userUuid: string, event: string, data: any) {
        const socketId = this.activeUsers.get(userUuid);
        if (socketId) {
            this.server.to(socketId).emit(event, data);
        }
    }
}
