import 'express';
import { UserEntity } from 'src/domain/user/entity/user.entity';

declare module 'express' {
    interface Request {
        user: UserEntity;
    }
}