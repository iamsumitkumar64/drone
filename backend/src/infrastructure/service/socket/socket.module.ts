import { Global, Module } from "@nestjs/common";
import { SocketService } from "./socket.service.js";
import { UserRepository } from "../../repository/user-repository/user-repository.js";
import { JwtHelperService } from "../jwt/jwt.service.js";

@Global()
@Module({
    providers: [SocketService, JwtHelperService, UserRepository],
    exports: [SocketService],
})
export class SocketModule { }
