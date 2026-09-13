import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class JwtHelperService {
    constructor(private readonly jwtService: JwtService) { }

    async generateJwtToken(payload: Record<any, any>) {
        const { ...plainPayload } = { ...payload };
        return await this.jwtService.signAsync(plainPayload);
    }

    async verifyJwtToken(token: string) {
        token = token.replace(/^"(.*)"$/, '$1');
        return await this.jwtService.verifyAsync(token);
    }
}