import { Injectable } from '@nestjs/common';
import { LoginUserDto } from './login-user.dto.js';
import { UserRepository } from '../../../infrastructure/repository/user-repository/user-repository.js';
import { JwtHelperService } from '../../../infrastructure/service/jwt/jwt.service.js';
import { BcryptService } from '../../../infrastructure/service/bcrypt/bcrypt.service.js';
import { UserNotFoundException } from '../../../domain/user/exception/user-not-found/user-not-found.exception.js';
import { InvalidCredentialsException } from '../../../domain/user/exception/invalid-credentials/invalid-credentials.exception.js';

@Injectable()
export class LoginUserHandler {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtHelperService: JwtHelperService,
    private readonly bcryptService: BcryptService,
  ) { }

  async handle(body: LoginUserDto) {
    // check if user exists using this email
    const user = await this.userRepository.findByEmail(body.email);
    if (!user) {
      throw new UserNotFoundException();
    }

    // verify password
    const isValid = await this.bcryptService.verifyPassword(body.password, user.password);
    if (!isValid) {
      throw new InvalidCredentialsException();
    }

    const access_token = await this.jwtHelperService.generateJwtToken(user);

    return {
      access_token: access_token,
      user: {
        username: user.username,
        email: user.email,
        role: user.role,
        uid: user.uuid,
      },
    };
  }
}
