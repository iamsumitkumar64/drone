import { IsString, IsEmail, IsNotEmpty, MinLength, IsEnum } from 'class-validator';
import { NormalizeWhitespace } from '../../../infrastructure/transform/normalize-whitespace/normalize-whitespace.js';
import { UserRoleEnum } from '../../../domain/user/enum/user-role/user-role.enum.js';

export class RegisterUserDto {
    @NormalizeWhitespace()
    @IsString()
    @IsNotEmpty()
    username: string;

    @NormalizeWhitespace({ toLowerCase: true })
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @MinLength(3)
    password: string;

    @IsEnum(UserRoleEnum)
    role: UserRoleEnum;
}